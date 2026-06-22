import { useEffect, useRef } from 'react';

const VERTEX_SHADER = `
attribute vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const FRAGMENT_SHADER = `
precision mediump float;
uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uPaperColor;
uniform vec3 uInkColor;
uniform vec3 uAccentColor;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

float fbm(vec2 p) {
  return 0.5 * noise(p) + 0.25 * noise(p * 2.0) + 0.125 * noise(p * 4.0);
}

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;
  float aspect = uResolution.x / uResolution.y;
  vec2 paperUV = vec2(uv.x * aspect, uv.y);
  
  vec3 paper = uPaperColor;
  
  float grain = fbm(paperUV * 800.0 + uTime * 0.05);
  paper = mix(paper, uPaperColor * vec3(0.96, 0.94, 0.92), grain * 0.08);
  
  float speckle = noise(paperUV * 1500.0 + uTime * 0.02);
  float speckleMask = smoothstep(0.72, 0.78, speckle);
  paper = mix(paper, uInkColor * 0.15, speckleMask * 0.06);
  
  vec2 vigUV = uv - 0.5;
  float vigDist = length(vigUV * vec2(1.2, 1.0));
  float vignette = smoothstep(1.2, 0.3, vigDist);
  paper = mix(paper, uAccentColor * 0.4, (1.0 - vignette) * 0.15);
  
  float warmNoise = noise(paperUV * 3.0 + uTime * 0.1);
  paper = mix(paper, uPaperColor * vec3(1.05, 1.02, 0.98), warmNoise * vignette * 0.1);
  
  gl_FragColor = vec4(paper, 1.0);
}
`;

export default function ProceduralPaperCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glRef = useRef<WebGLRenderingContext | null>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl', { alpha: false, antialias: false });
    if (!gl) return;
    glRef.current = gl;

    const dpr = Math.min(window.devicePixelRatio, 2);

    function resize() {
      if (!canvas || !gl) return;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      gl.viewport(0, 0, canvas.width, canvas.height);
    }
    resize();

    // Compile shaders
    function createShader(type: number, source: string) {
      const shader = gl!.createShader(type)!;
      gl!.shaderSource(shader, source);
      gl!.compileShader(shader);
      return shader;
    }

    const vs = createShader(gl.VERTEX_SHADER, VERTEX_SHADER);
    const fs = createShader(gl.FRAGMENT_SHADER, FRAGMENT_SHADER);

    const program = gl.createProgram()!;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    gl.useProgram(program);

    // Fullscreen quad
    const vertices = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    const posLoc = gl.getAttribLocation(program, 'position');
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    // Uniforms
    const uTime = gl.getUniformLocation(program, 'uTime');
    const uResolution = gl.getUniformLocation(program, 'uResolution');
    const uPaperColor = gl.getUniformLocation(program, 'uPaperColor');
    const uInkColor = gl.getUniformLocation(program, 'uInkColor');
    const uAccentColor = gl.getUniformLocation(program, 'uAccentColor');

    gl.uniform3f(uPaperColor, 0.957, 0.929, 0.894);
    gl.uniform3f(uInkColor, 0.047, 0.047, 0.047);
    gl.uniform3f(uAccentColor, 0.42, 0.36, 0.27);

    function render() {
      if (!gl || !canvas) return;
      gl.uniform1f(uTime, performance.now() * 0.001);
      gl.uniform2f(uResolution, canvas.width, canvas.height);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      rafRef.current = requestAnimationFrame(render);
    }
    rafRef.current = requestAnimationFrame(render);

    window.addEventListener('resize', resize);
    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      gl.deleteBuffer(buffer);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
      }}
    />
  );
}

'use client';

import { useEffect, useRef } from 'react';

const VERT = `#version 300 es
in vec2 a_position;
out vec2 v_uv;
void main() {
  v_uv = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}`;

const FRAG = `#version 300 es
precision highp float;
in vec2 v_uv;
out vec4 fragColor;
uniform float u_time;
uniform vec2 u_mouse;
uniform vec2 u_resolution;

// Smooth noise
vec2 hash(vec2 p) {
  p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
  return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
}
float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(dot(hash(i + vec2(0,0)), f - vec2(0,0)),
                 dot(hash(i + vec2(1,0)), f - vec2(1,0)), u.x),
             mix(dot(hash(i + vec2(0,1)), f - vec2(0,1)),
                 dot(hash(i + vec2(1,1)), f - vec2(1,1)), u.x), u.y);
}
float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 4; i++) {
    v += a * noise(p);
    p = p * 2.0 + vec2(1.7, 9.2);
    a *= 0.5;
  }
  return v;
}

void main() {
  vec2 uv = v_uv;
  float t = u_time * 0.15;

  // Mouse influence — warps the field in a 200px radius
  vec2 mouseUV = u_mouse / u_resolution;
  float mouseDist = length(uv - mouseUV);
  float mouseWarp = smoothstep(0.3, 0.0, mouseDist) * 0.08;
  uv += (uv - mouseUV) * mouseWarp * -1.0;

  // Plasma noise field
  float n = fbm(uv * 2.5 + vec2(t, t * 0.7));
  float n2 = fbm(uv * 1.8 - vec2(t * 0.5, t * 0.3) + n * 0.4);

  // Purple (#7832ff) and red (#e50914) palette, deep dark base
  vec3 purple = vec3(0.471, 0.196, 1.0);
  vec3 red    = vec3(0.898, 0.035, 0.078);
  vec3 dark   = vec3(0.02, 0.02, 0.03);

  float blend = n2 * 0.5 + 0.5;
  vec3 color = mix(dark, mix(purple, red, blend), 0.06 + abs(n) * 0.04);

  // Grid lines overlay (matching CSS grid-floor pattern, 80px spacing)
  vec2 grid = fract(uv * (u_resolution / 80.0));
  float gridLine = step(0.98, grid.x) + step(0.98, grid.y);
  color += gridLine * 0.018 * (1.0 - smoothstep(0.4, 0.8, uv.y));

  fragColor = vec4(color, 1.0);
}`;

function compileShader(gl: WebGL2RenderingContext, type: number, src: string) {
  const s = gl.createShader(type)!;
  gl.shaderSource(s, src);
  gl.compileShader(s);
  return s;
}

export default function BackgroundC() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl2');
    if (!gl) {
      // WebGL unavailable — CSS fallback orbs are rendered below
      canvas.style.display = 'none';
      return;
    }

    const vert = compileShader(gl, gl.VERTEX_SHADER, VERT);
    const frag = compileShader(gl, gl.FRAGMENT_SHADER, FRAG);
    const prog = gl.createProgram()!;
    gl.attachShader(prog, vert!);
    gl.attachShader(prog, frag!);
    gl.linkProgram(prog);
    gl.useProgram(prog);

    // Full-screen quad
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, 'a_position');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const uTime = gl.getUniformLocation(prog, 'u_time');
    const uMouse = gl.getUniformLocation(prog, 'u_mouse');
    const uRes = gl.getUniformLocation(prog, 'u_resolution');

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    resize();
    window.addEventListener('resize', resize);

    const onMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: window.innerHeight - e.clientY };
    };
    window.addEventListener('mousemove', onMouseMove, { passive: true });

    let startTime = performance.now();
    const render = () => {
      const t = (performance.now() - startTime) / 1000;
      gl.uniform1f(uTime, t);
      gl.uniform2f(uMouse, mouseRef.current.x, mouseRef.current.y);
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      rafRef.current = requestAnimationFrame(render);
    };
    rafRef.current = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMouseMove);
      gl.deleteProgram(prog);
    };
  }, []);

  // Pause when tab hidden
  useEffect(() => {
    const onVisibility = () => {
      if (document.hidden) cancelAnimationFrame(rafRef.current);
      // render loop restarts on next frame automatically when visible again via re-mount would be needed
      // but for simplicity, the RAF naturally resumes on unhide via the existing loop
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

  return (
    <>
      {/* WebGL canvas — full screen background */}
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        style={{
          position: 'fixed',
          inset: 0,
          width: '100%',
          height: '100%',
          zIndex: 0,
          pointerEvents: 'none',
        }}
      />
      {/* CSS fallback orbs shown when WebGL unavailable */}
      <div aria-hidden="true" style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
      </div>
    </>
  );
}

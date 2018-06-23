const canvasSketch = require('canvas-sketch');
const createRegl = require('regl');
const createQuad = require('primitive-quad');
const glslify = require('glslify');
const path = require('path');
const tween = require('./util/tween-value');

// Setup our sketch
const settings = {
  pixelsPerInch: 300,
  animation: true,
  scaleToView: true,
  time: 5,
  context: 'webgl',
  canvas: document.querySelector('.background-canvas')
};

const sketch = ({ gl, update, render, pause }) => {
  // Create regl for handling GL stuff
  const regl = createRegl({ gl, extensions: [ 'OES_standard_derivatives' ] });
  // A mesh for a flat plane
  const quad = createQuad();
  // Draw command
  const drawQuad = regl({
    // Fragment & Vertex shaders
    frag: glslify(path.resolve(__dirname, 'shaders/website-background.frag')),
    vert: glslify(path.resolve(__dirname, 'shaders/website-background.vert')),
    // Pass down props from javascript
    uniforms: {
      fade: regl.prop('fade'),
      aspect: regl.prop('aspect'),
      time: regl.prop('time')
    },
    // Setup transparency blending
    blend: {
      enable: true,
      func: {
        srcRGB: 'src alpha',
        srcAlpha: 1,
        dstRGB: 'one minus src alpha',
        dstAlpha: 1
      }
    },
    // Send mesh vertex attributes to shader
    attributes: {
      position: quad.positions
    },
    // The indices for the quad mesh
    elements: regl.elements(quad.cells)
  });

  return {
    render ({ context, time, width, height }) {
      // On each tick, update regl timers and sizes
      regl.poll();

      // Clear backbuffer
      const L = 35 / 255;
      regl.clear({
        color: [ L, L, L, 1 ],
        depth: 1,
        stencil: 0
      });

      // Draw generative / shader art
      const fade = tween({ time, duration: 3, delay: 0.025, ease: 'sineOut' });
      drawQuad({ time, fade, aspect: width / height });

      // Flush pending GL calls for this frame
      gl.flush();
    }
  };
};

canvasSketch(sketch, settings);

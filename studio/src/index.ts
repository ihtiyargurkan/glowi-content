import React from 'react';
import {Composition, registerRoot} from 'remotion';
import {Main, totalSeconds} from './Main';
import {FPS, W, H} from './theme';

const Root: React.FC = () =>
  React.createElement(Composition, {id: 'GlowiReel', component: Main, durationInFrames: Math.ceil(totalSeconds() * FPS), fps: FPS, width: W, height: H});

registerRoot(Root);

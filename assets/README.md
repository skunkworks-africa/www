# Skunkworks logo assets

The approved artwork and usage rules are documented in the
[Skunkworks Design System logo library](https://brand.skunkworks.africa/logos/).

## Header exports

`logo-black-header.png` and `logo-white-header.png` are 768 × 768 transparent
RGBA exports of the existing `logo-black.svg` and `logo-white.svg` masters.
They preserve the original artwork, proportions and canvas, and provide ample
pixel density for the 36px mobile and 38px desktop navigation images.

The original SVG files contain embedded high-resolution PNG artwork and a
grayscale mask, rather than vector outlines. Their two colour-matrix filters
convert that grayscale mask to white with matching alpha. For the header
exports, the same mask was evaluated directly as sRGB luminance before
rendering to PNG with Sharp at density 96 and resizing to 768 × 768. No image
data, transform, clip path or viewBox was changed during that conversion.
The original SVG and PNG masters remain unchanged.

Use the black export on light surfaces and the white export on dark surfaces.
Keep the mark proportional, with at least 32px of visible artwork and clear
space of at least one quarter of its height. The shared navigation uses a
36px image on mobile because the master canvas includes a small margin.

Do not substitute the padded PNG masters or a small favicon in navigation:
they have different framing. Use these header-specific filenames to avoid
reusing cached filtered SVGs when deploying the logo fix.

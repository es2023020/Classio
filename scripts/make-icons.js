const sharp = require('sharp')
const fs = require('fs')

async function run() {
  const left = 272
  const top = 196
  const size = 480

  // Create smooth squircle mask
  const mask = Buffer.from(
    `<svg width="512" height="512">
      <rect x="0" y="0" width="512" height="512" rx="112" ry="112" fill="#fff" />
    </svg>`
  )

  await sharp('public/logo.png')
    .extract({ left, top, width: size, height: size })
    .resize(512, 512)
    .composite([{ input: mask, blend: 'dest-in' }])
    .png()
    .toFile('public/classio-icon.png')

  console.log('✓ public/classio-icon.png created')

  await sharp('public/classio-icon.png')
    .resize(192, 192)
    .toFile('public/icon-192.png')

  await sharp('public/classio-icon.png')
    .resize(180, 180)
    .toFile('public/apple-icon.png')

  await sharp('public/classio-icon.png')
    .resize(32, 32)
    .toFile('public/icon-32.png')

  console.log('✓ All responsive icon variants created successfully')
}

run().catch(console.error)

import {  Page } from '@/lib/feature/library'
import Image from 'next/image'
import React from 'react'

function PageRender({page}: {page: Page}) {
  return (
         <div
            key={page.id}
            style={{
              position: "relative",
              width: page.width,
              height: page.height,
              border: "1px solid black",
              background: "#faf7ef",
            }}
          >
            {page.data.map((block) => {
              /*
               * IMAGE BLOCK
               */
              if (block.type === 1) {
                const [x0, y0, x1, y1] = block.bbox;

                return (
                  <Image
                    key={`${page.id}-${block.number}`}
                    src={block.src}
                    alt=""
                    width={x1 - x0}
                    height={y1 - y0}
                    style={{
                      position: "absolute",
                      left: x0,
                      top: y0,
                    }}
                  />
                );
              }

              /*
               * TEXT BLOCK
               */
              if (block.type === 0) {
                return block.lines.flatMap(
                  (line, lineIndex) =>
                    line.spans.map((span, spanIndex) => {
                      const [x0, y0, x1, y1] = span.bbox;

                      return (
                        <span
                          key={`${page.id}-${block.number}-${lineIndex}-${spanIndex}`}
                          style={{
                            position: "absolute",
                            left: x0,
                            top: y0,
                            width: x1 - x0,
                            height: y1 - y0,
                            fontSize: span.size,
                            fontFamily: span.font,
                            whiteSpace: "pre",
                          }}
                        >
                          {span.text}
                        </span>
                      );
                    })
                );
              }

              return null;
            })}
          </div>
  )
}

export default PageRender
                labelFont = resolveLabelFont(style.layers) || ['Noto Sans Arabic', 'Noto Sans Regular'];
                // Swap the glyphs only when no basemap label reads them (or there
                // are none), so a basemap label on a default or data-driven font
                // keeps its glyph source.
                var basemapText = (style.layers || []).some(function (layer) {
                    return layer.type === 'symbol' && layer.layout && layer.layout['text-field'];
                });
                if (!style.glyphs || !basemapText) map.setGlyphs(config.labelGlyphs);
            }
            spec.layout['text-font'] = labelFont;
            map.addLayer(spec);
        }

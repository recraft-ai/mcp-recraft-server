import { ImageSize } from "../api/models/ImageSize"
import { ImageStyle } from "../api/models/ImageStyle"
import { ImageSubStyle } from "../api/models/ImageSubStyle"
import { TransformModel } from "../api/models/TransformModel"

export const PARAMETERS = {
  imageSize: {
    type: "string",
    enum: Object.values(ImageSize),
    description: "Image dimensions. Default is 1024x1024."
  },

  imageStyle: {
    type: "string",
    enum: Object.values(ImageStyle),
    description: "Visual style to apply. Default is realistic_image.\n" +
      "Use this parameter only if you want to refine the image generation.\n" +
      "Mutually exclusive with styleID, you can't specify both of them.\n" +
      "realistic_image, digital_illustration, vector_illustration are available in both models, " +
      "but icon is available only for recraftv2, and logo_raster is available only for recraftv3.\n" +
      "If you will provide a style that is not available for the specified model, generation will fail.\n" +
      "Styles use-cases:\n" +
      "- realistic_image: for realistic images, photos, portraits, landscapes, etc. Raster is generated.\n" +
      "- digital_illustration: for digital illustrations, concept art, fantasy art, etc. Raster is generated.\n" + 
      "- vector_illustration: for vector illustrations, logos, icons, etc. Vector is generated.\n" +
      "- icon: for icons, small graphics (only in recraftv2). Vector is generated\n" +
      "- logo_raster: for graphic design, raster logos, posters, emblems, and badges (only in recraftv3). Raster is generated."
  },

  imageSubStyle: {
    type: "string",
    enum: Object.values(ImageSubStyle),
    description: "Visual substyle to apply. Can be specified only with style to refine more specifically.\n" +
      "If this parameter is not specified, model will decide on the final style. Use this parameter only if you want to refine the image generation more. No need to specify if you don't have any specific requirements.\n" +
      "Note that each combination of model and style has their own list of available substyles:\n" +
      "- recraftv3 with style realistic_image: b_and_w, enterprise, evening_light, faded_nostalgia, forest_life, hard_flash, hdr, motion_blur, mystic_naturalism, natural_light, natural_tones, organic_calm, real_life_glow, retro_realism, retro_snapshot, studio_portrait, urban_drama, village_realism, warm_folk\n" + 
      "- recraftv2 with style realistic_image: b_and_w, enterprise, hard_flash, hdr, motion_blur, natural_light, studio_portrait\n" +
      "- recraftv3 with style digital_illustration: 2d_art_poster, 2d_art_poster_2, antiquarian, bold_fantasy, child_book, cover, crosshatch, digital_engraving, engraving_color, expressionism, freehand_details, grain, grain_20, graphic_intensity, hand_drawn, hand_drawn_outline, handmade_3d, hard_comics, infantile_sketch, long_shadow, modern_folk, multicolor, neon_calm, noir, nostalgic_pastel, outline_details, pastel_gradient, pastel_sketch, pixel_art, plastic, pop_art, pop_renaissance, seamless, street_art, tablet_sketch, urban_glow, urban_sketching, young_adult_book, young_adult_book_2\n" + 
      "- recraftv2 with style digital_illustration: 2d_art_poster, 2d_art_poster_2, 3d, 80s, engraving_color, glow, grain, hand_drawn, hand_drawn_outline, handmade_3d, infantile_sketch, kawaii, pixel_art, plastic, psychedelic, seamless, voxel, watercolor\n" +
      "- recraftv3 with style vector_illustration: bold_stroke, chemistry, colored_stencil, cosmics, cutout, depressive, editorial, emotional_flat, engraving, line_art, line_circuit, linocut, marker_outline, mosaic, naivector, roundish_flat, seamless, segmented_colors, sharp_contrast, thin, vector_photo, vivid_shapes\n" + 
      "- recraftv2 with style vector_illustration: cartoon, doodle_line_art, engraving, flat_2, kawaii, line_art, line_circuit, linocut, seamless\n" +
      "- recraftv2 with style icon: broken_line, colored_outline, colored_shapes, colored_shapes_gradient, doodle_fill, doodle_offset_fill, offset_fill, outline, outline_gradient, pictogram\n" +
      "- recraftv3 with style logo_raster: emblem_graffiti, emblem_pop_art, emblem_punk, emblem_stamp, emblem_vintage\n" +
      "If you will provide a substyle that is not available for the specified model and style, generation will fail."
  },

  imageStyleID: {
    type: "string",
    description: "ID of the style to apply. Mutually exclusive with style, you can't specify both of them.\n" +
      "This ID can be the style ID from recraft.ai or some previously created custom style."
  },

  transformModel: {
    type: "string",
    enum: [
      TransformModel.Recraftv41Vector,
      TransformModel.Recraftv41Raster,
      TransformModel.Recraftv41ProVector,
      TransformModel.Recraftv41ProRaster,
      TransformModel.Recraftv4Vector,
      TransformModel.Recraftv4Raster,
      TransformModel.Recraftv4ProVector,
      TransformModel.Recraftv4ProRaster,
      TransformModel.Recraftv3,
      TransformModel.Recraftv2,
    ],
    description: "Model version to use. Default is recraftv4_1_vector.\n" +
      "Recraft V4 family (launched Feb 2026) is the current state-of-the-art generation.\n" +
      "V4/V4.1 models are style-less — they do NOT accept the `style` or `substyle` parameters. " +
      "To steer V4 output use `styleID` (custom style created from reference images) or rely on the model's own design taste.\n" +
      "V3/V2 keep the legacy style+substyle workflow and remain valid for cases where explicit style control is required (e.g. validated combo `vector_illustration + line_art` for clean line-art logos).\n" +
      "Models:\n" +
      "- recraftv4_1_vector: V4.1 vector output, $0.08/image. Default. Best for logos, brand assets, illustrations needing SVG.\n" +
      "- recraftv4_1_raster: V4.1 raster output, $0.04/image. Best for marketing imagery, posters, photographic-style.\n" +
      "- recraftv4_1_pro_vector / recraftv4_1_pro_raster: V4.1 Pro tier ($0.30 / $0.25). Higher fidelity, more compute.\n" +
      "- recraftv4_vector / recraftv4_raster / recraftv4_pro_*: V4 (pre-4.1) generation, same pricing tiers.\n" +
      "- recraftv3: legacy, supports full style+substyle taxonomy. $0.08/vector $0.04/raster.\n" +
      "- recraftv2: older legacy, cheapest.\n" +
      "When `style` or `substyle` is provided with a V4/V4.1 model the request will be rejected before reaching the API."
  },

  numberOfImages: {
    type: "integer",
    minimum: 1,
    maximum: 6,
    description: "Number of images to generate. Should be from 1 to 6. Default is 1."
  },

  promptSimple: {
    type: "string",
    description: "Text prompt of the image you want to generate.\n" +
      "Its length should be from 1 to 1024 characters."
  },

  imageURI: {
    type: "string",
    description: "Image to use as an input. This can be a URL (starting with http:// or https://) or an absolute file path (starting with file://)."
  },
}

export const STYLE_PRESERVATION_WARNING = "You should provide the same style/substyle/styleID settings as were used for input image generation (if they exist) if there are no specific requirements to change the style in the resulting image."

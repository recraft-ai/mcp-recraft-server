/* tslint:disable */
/* eslint-disable */
/**
 * recraft.ai external api
 * No description provided (generated by Openapi Generator https://github.com/openapitools/openapi-generator)
 *
 * The version of the OpenAPI document: 0.0.1
 * 
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */

import { mapValues } from '../runtime';
import type { ResponseFormat } from './ResponseFormat';
import {
    ResponseFormatFromJSON,
    ResponseFormatFromJSONTyped,
    ResponseFormatToJSON,
    ResponseFormatToJSONTyped,
} from './ResponseFormat';
import type { TextLayoutItem } from './TextLayoutItem';
import {
    TextLayoutItemFromJSON,
    TextLayoutItemFromJSONTyped,
    TextLayoutItemToJSON,
    TextLayoutItemToJSONTyped,
} from './TextLayoutItem';
import type { TransformModel } from './TransformModel';
import {
    TransformModelFromJSON,
    TransformModelFromJSONTyped,
    TransformModelToJSON,
    TransformModelToJSONTyped,
} from './TransformModel';
import type { ImageSize } from './ImageSize';
import {
    ImageSizeFromJSON,
    ImageSizeFromJSONTyped,
    ImageSizeToJSON,
    ImageSizeToJSONTyped,
} from './ImageSize';
import type { UserControls } from './UserControls';
import {
    UserControlsFromJSON,
    UserControlsFromJSONTyped,
    UserControlsToJSON,
    UserControlsToJSONTyped,
} from './UserControls';
import type { ImageStyle } from './ImageStyle';
import {
    ImageStyleFromJSON,
    ImageStyleFromJSONTyped,
    ImageStyleToJSON,
    ImageStyleToJSONTyped,
} from './ImageStyle';
import type { ImageSubStyle } from './ImageSubStyle';
import {
    ImageSubStyleFromJSON,
    ImageSubStyleFromJSONTyped,
    ImageSubStyleToJSON,
    ImageSubStyleToJSONTyped,
} from './ImageSubStyle';
import type { ImageFormat } from './ImageFormat';
import {
    ImageFormatFromJSON,
    ImageFormatFromJSONTyped,
    ImageFormatToJSON,
    ImageFormatToJSONTyped,
} from './ImageFormat';

/**
 * 
 * @export
 * @interface GenerateImageRequest
 */
export interface GenerateImageRequest {
    /**
     * 
     * @type {boolean}
     * @memberof GenerateImageRequest
     */
    blockNsfw?: boolean;
    /**
     * 
     * @type {boolean}
     * @memberof GenerateImageRequest
     */
    calculateFeatures?: boolean;
    /**
     * 
     * @type {UserControls}
     * @memberof GenerateImageRequest
     */
    controls?: UserControls;
    /**
     * 
     * @type {boolean}
     * @memberof GenerateImageRequest
     */
    expire?: boolean;
    /**
     * 
     * @type {ImageFormat}
     * @memberof GenerateImageRequest
     */
    imageFormat?: ImageFormat;
    /**
     * 
     * @type {TransformModel}
     * @memberof GenerateImageRequest
     */
    model?: TransformModel;
    /**
     * 
     * @type {number}
     * @memberof GenerateImageRequest
     */
    n?: number;
    /**
     * 
     * @type {string}
     * @memberof GenerateImageRequest
     */
    negativePrompt?: string;
    /**
     * 
     * @type {string}
     * @memberof GenerateImageRequest
     */
    prompt: string;
    /**
     * 
     * @type {number}
     * @memberof GenerateImageRequest
     */
    randomSeed?: number;
    /**
     * 
     * @type {ResponseFormat}
     * @memberof GenerateImageRequest
     */
    responseFormat?: ResponseFormat;
    /**
     * 
     * @type {ImageSize}
     * @memberof GenerateImageRequest
     */
    size?: ImageSize;
    /**
     * 
     * @type {ImageStyle}
     * @memberof GenerateImageRequest
     */
    style?: ImageStyle;
    /**
     * 
     * @type {string}
     * @memberof GenerateImageRequest
     */
    styleId?: string;
    /**
     * 
     * @type {ImageSubStyle}
     * @memberof GenerateImageRequest
     */
    substyle?: ImageSubStyle;
    /**
     * 
     * @type {Array<TextLayoutItem>}
     * @memberof GenerateImageRequest
     */
    textLayout?: Array<TextLayoutItem>;
}



/**
 * Check if a given object implements the GenerateImageRequest interface.
 */
export function instanceOfGenerateImageRequest(value: object): value is GenerateImageRequest {
    if (!('prompt' in value) || value['prompt'] === undefined) return false;
    return true;
}

export function GenerateImageRequestFromJSON(json: any): GenerateImageRequest {
    return GenerateImageRequestFromJSONTyped(json, false);
}

export function GenerateImageRequestFromJSONTyped(json: any, ignoreDiscriminator: boolean): GenerateImageRequest {
    if (json == null) {
        return json;
    }
    return {
        
        'blockNsfw': json['block_nsfw'] == null ? undefined : json['block_nsfw'],
        'calculateFeatures': json['calculate_features'] == null ? undefined : json['calculate_features'],
        'controls': json['controls'] == null ? undefined : UserControlsFromJSON(json['controls']),
        'expire': json['expire'] == null ? undefined : json['expire'],
        'imageFormat': json['image_format'] == null ? undefined : ImageFormatFromJSON(json['image_format']),
        'model': json['model'] == null ? undefined : TransformModelFromJSON(json['model']),
        'n': json['n'] == null ? undefined : json['n'],
        'negativePrompt': json['negative_prompt'] == null ? undefined : json['negative_prompt'],
        'prompt': json['prompt'],
        'randomSeed': json['random_seed'] == null ? undefined : json['random_seed'],
        'responseFormat': json['response_format'] == null ? undefined : ResponseFormatFromJSON(json['response_format']),
        'size': json['size'] == null ? undefined : ImageSizeFromJSON(json['size']),
        'style': json['style'] == null ? undefined : ImageStyleFromJSON(json['style']),
        'styleId': json['style_id'] == null ? undefined : json['style_id'],
        'substyle': json['substyle'] == null ? undefined : ImageSubStyleFromJSON(json['substyle']),
        'textLayout': json['text_layout'] == null ? undefined : ((json['text_layout'] as Array<any>).map(TextLayoutItemFromJSON)),
    };
}

export function GenerateImageRequestToJSON(json: any): GenerateImageRequest {
    return GenerateImageRequestToJSONTyped(json, false);
}

export function GenerateImageRequestToJSONTyped(value?: GenerateImageRequest | null, ignoreDiscriminator: boolean = false): any {
    if (value == null) {
        return value;
    }

    return {
        
        'block_nsfw': value['blockNsfw'],
        'calculate_features': value['calculateFeatures'],
        'controls': UserControlsToJSON(value['controls']),
        'expire': value['expire'],
        'image_format': ImageFormatToJSON(value['imageFormat']),
        'model': TransformModelToJSON(value['model']),
        'n': value['n'],
        'negative_prompt': value['negativePrompt'],
        'prompt': value['prompt'],
        'random_seed': value['randomSeed'],
        'response_format': ResponseFormatToJSON(value['responseFormat']),
        'size': ImageSizeToJSON(value['size']),
        'style': ImageStyleToJSON(value['style']),
        'style_id': value['styleId'],
        'substyle': ImageSubStyleToJSON(value['substyle']),
        'text_layout': value['textLayout'] == null ? undefined : ((value['textLayout'] as Array<any>).map(TextLayoutItemToJSON)),
    };
}


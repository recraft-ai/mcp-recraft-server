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
/**
 * 
 * @export
 * @interface ImageFeatures
 */
export interface ImageFeatures {
    /**
     * 
     * @type {number}
     * @memberof ImageFeatures
     */
    nsfwScore?: number;
}

/**
 * Check if a given object implements the ImageFeatures interface.
 */
export function instanceOfImageFeatures(value: object): value is ImageFeatures {
    return true;
}

export function ImageFeaturesFromJSON(json: any): ImageFeatures {
    return ImageFeaturesFromJSONTyped(json, false);
}

export function ImageFeaturesFromJSONTyped(json: any, ignoreDiscriminator: boolean): ImageFeatures {
    if (json == null) {
        return json;
    }
    return {
        
        'nsfwScore': json['nsfw_score'] == null ? undefined : json['nsfw_score'],
    };
}

export function ImageFeaturesToJSON(json: any): ImageFeatures {
    return ImageFeaturesToJSONTyped(json, false);
}

export function ImageFeaturesToJSONTyped(value?: ImageFeatures | null, ignoreDiscriminator: boolean = false): any {
    if (value == null) {
        return value;
    }

    return {
        
        'nsfw_score': value['nsfwScore'],
    };
}


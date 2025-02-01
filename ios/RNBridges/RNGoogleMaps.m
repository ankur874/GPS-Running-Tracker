//
//  RNGoogleMaps.m
//  fitnesstracker
//
//  Created by Ankur Attri on 24/01/25.
//

#import <Foundation/Foundation.h>
#import "React/RCTBridgeModule.h"
#import "React/RCTEventEmitter.h"

@interface RCT_EXTERN_MODULE(RNGoogleMaps , RCTEventEmitter)

RCT_EXTERN_METHOD(initiateGoogleMaps:(NSDictionary *)message resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(getUpdatedSteps:(NSDictionary *)message resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)
@end

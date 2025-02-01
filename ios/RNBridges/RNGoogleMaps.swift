//
//  RNGoogleMaps.swift
//  fitnesstracker
//
//  Created by Ankur Attri on 24/01/25.
//


import Foundation
import React

@objc(RNGoogleMaps)
class RNGoogleMaps : NSObject {
  
  @objc
  func initiateGoogleMaps(_ message: [String:Any] , resolve: @escaping RCTPromiseResolveBlock , reject: @escaping RCTPromiseRejectBlock) {
    DispatchQueue.main.async {
      if let topVC = UIApplication.shared.keyWindow?.rootViewController {
        let mapViewController = GoogleMapViewViewController(contract: message)
        topVC.present(mapViewController, animated: true) {
          
        }
        
      }
    }
  }
  
  @objc
  func getUpdatedSteps(_ message: [String:Any] , resolve: @escaping RCTPromiseResolveBlock , reject: @escaping RCTPromiseRejectBlock) {
    let stepCounter = StepCounter()
    stepCounter.fetchStepsForLastFourDays { data in
      resolve(data)
    }
  }
  
}

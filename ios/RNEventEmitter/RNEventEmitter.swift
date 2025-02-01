//
//  RNEventEmitter.swift
//  fitnesstracker
//
//  Created by Ankur Attri on 25/01/25.
//

import Foundation
import React


@objc(RNEventEmitter)
open class RNEventEmitter: RCTEventEmitter {
  public static var emitter: RCTEventEmitter!
  
  public override init() {
    super.init()
    RNEventEmitter.emitter = self
  }
  
  open override func supportedEvents() -> [String]! {
    return ["onStartWorkout","onEndWorkout"]
  }
}

//
//  LocationManager.swift
//  fitnesstracker
//
//  Created by Ankur Attri on 24/01/25.
//

import UIKit
import CoreLocation


protocol LocationDelegate: AnyObject {
  func didUpdateLocation(lat: CLLocationDegrees , long: CLLocationDegrees)
}

class LocationManager: NSObject, CLLocationManagerDelegate {
  private var locationManager: CLLocationManager!
  weak var delegate: LocationDelegate?
  
  
  override init() {
    super.init()
    locationManager = CLLocationManager()
    locationManager.delegate = self
    if #available(iOS 14.0, *) {
      locationManager.desiredAccuracy  = kCLLocationAccuracyHundredMeters
    } else {
      locationManager.desiredAccuracy  = kCLLocationAccuracyHundredMeters
    }
    locationManager.requestAlwaysAuthorization()
  }
  
  deinit {
     print("LocationManager is being deinitialized")
     locationManager.stopUpdatingLocation()
     locationManager.delegate = nil
     delegate = nil
   }
  
  func startUpdatingLocation() {
    locationManager.startUpdatingLocation()
  }
  
  func stopUpdatingLocation() {
    locationManager.stopUpdatingLocation()
  }
  
  func locationManager(_ manager: CLLocationManager, didUpdateLocations locations: [CLLocation]) {
    guard let location = locations.last else { return }
    
    let latitude = location.coordinate.latitude
    let longitude = location.coordinate.longitude
    delegate?.didUpdateLocation(lat: latitude, long: longitude)
     
  }
}

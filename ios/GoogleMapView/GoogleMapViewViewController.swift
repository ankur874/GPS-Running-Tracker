//
//  GoogleMapViewViewController.swift
//  fitnesstracker
//
//  Created by Ankur Attri on 24/01/25.
//

import UIKit
import GoogleMaps
import Foundation

enum ActivityType: String, Codable {
  case indoor
  case outdoor
}

enum LOB: String, Codable {
  case selfLOB = "self"
  case group
}

enum SubType: String, Codable {
  case running
  case cycling
  case trek
  case walking
}

struct UserCoordinate: Codable {
  var lat: Double?
  var long: Double?
}

struct SubActivity: Codable {
  var startTime: String?
  var endTime: String?
  var duration: String?
  var length: String?
  var averageSpeed: String?
  var coordinates: [UserCoordinate]?
}

struct Activity: Codable {
  var id: String?
  var lob: LOB?
  var type: ActivityType?
  var subType: SubType?
  var date: String?
  var isLive: Bool?
  var activityDetails: SubActivity?
  var currentlyGoingOn: Bool?
}



class GoogleMapViewViewController: UIViewController , LocationDelegate {

  private var mapView: GMSMapView!
  private var activityPath: GMSMutablePath!
  private var locationManager: LocationManager!
  private var myLat: CLLocationDegrees!
  private var myLong: CLLocationDegrees!
  private var contract: Activity?
  private var isLive: Bool!
  private var currentlyGoingOn: Bool!
  var startTime: Date?
  var timer: Timer?
  var totalTime: TimeInterval = 0 {
    didSet{
      updateAverageSpeed()
    }
  }
  var totalDistance: CLLocationDistance = 0 
  var averageSpeed: Double {
       guard totalTime > 0 else { return 0 }
      return totalDistance / totalTime
  }
  


  var startButton: UIButton = {
    let startBtn = UIButton()
    startBtn.translatesAutoresizingMaskIntoConstraints = false
    startBtn.backgroundColor = .black
    startBtn.setTitleColor(.white, for: .normal)
    startBtn.layer.cornerRadius = 16
    let buttonTitle = NSAttributedString(
      string: "Start Workout",
      attributes: [
        .font: UIFont.boldSystemFont(ofSize: 16)
      ]
    )
    startBtn.setAttributedTitle(buttonTitle, for: .normal)
    startBtn.clipsToBounds = true
    startBtn.layer.zPosition = 3
   
    return startBtn
  }()
  
  var stopButton: UIButton = {
    let stopButton = UIButton()
    stopButton.translatesAutoresizingMaskIntoConstraints = false
    stopButton.backgroundColor = .black
    stopButton.setTitleColor(.white, for: .normal)
    stopButton.layer.cornerRadius = 16
    stopButton.layer.zPosition = 3
    let buttonTitle = NSAttributedString(
      string: "Stop Workout",
      attributes: [
        .font: UIFont.boldSystemFont(ofSize: 16)
      ]
    )
    stopButton.isHidden = true
    stopButton.setAttributedTitle(buttonTitle, for: .normal)
    stopButton.clipsToBounds = true
    
    return stopButton
  }()
  
  var workoutDetailsView: UIView = {
    let workoutView = UIView()
    workoutView.layer.zPosition = 3
    workoutView.layer.cornerRadius = 16
    workoutView.backgroundColor = .black
    workoutView.clipsToBounds = true
    workoutView.translatesAutoresizingMaskIntoConstraints = false
    workoutView.isHidden = true
    return workoutView
  }()
  
  var workoutTimeLabel: UILabel = {
    let timeLabel = UILabel()
    timeLabel.textColor = .white
    timeLabel.translatesAutoresizingMaskIntoConstraints = false
    timeLabel.font = UIFont.systemFont(ofSize: 24, weight: .bold)
    return timeLabel
  }()
  
  var totalDistanceLabel: UILabel = {
    let totalDistanceLabel = UILabel()
    totalDistanceLabel.textColor = .white
    totalDistanceLabel.translatesAutoresizingMaskIntoConstraints = false
    totalDistanceLabel.font = UIFont.systemFont(ofSize: 24, weight: .bold)
    return totalDistanceLabel
  }()
  
  var averageSpeedLabel: UILabel = {
    let averageSpeedLabel = UILabel()
    averageSpeedLabel.textColor = .white
    averageSpeedLabel.translatesAutoresizingMaskIntoConstraints = false
    averageSpeedLabel.font = UIFont.systemFont(ofSize: 24, weight: .bold)
    return averageSpeedLabel
  }()
  
 
  
  override func viewDidLoad() {
    super.viewDidLoad()
    activityPath = GMSMutablePath()
    locationManager = LocationManager()
    locationManager.delegate = self
    updateDataForActivityType()
    addSubviews()
  }
  
  
  init(contract: [String:Any]) {
    super.init(nibName: nil, bundle: nil)
    convertContractIntoActivity(with : contract)
  }
  
  deinit {
      timer?.invalidate()
      timer = nil
  }
  
  private func updateDataForActivityType() {
    if self.isLive {
      locationManager.startUpdatingLocation()
    } else {
      self.contract?.activityDetails?.coordinates?.forEach({ userCo in
        guard let lat = userCo.lat ,
              let long = userCo.long else {
          return
        }
        print("---this",lat,long)
        self.activityPath.addLatitude(lat, longitude: long)
      })
      guard let lat = self.contract?.activityDetails?.coordinates?.first?.lat,
            let long = self.contract?.activityDetails?.coordinates?.first?.long else {
        return
      }
      initGoogleMapView(lat , long)
      updateMapViewWithPolylines(with: self.activityPath)
      fillActivityDetails()
      if self.currentlyGoingOn == true {
        self.myLat = lat
        self.myLong = long
        stopButton.isHidden = false
        locationManager.startUpdatingLocation()
        let startTimeString = self.contract?.activityDetails?.startTime ?? ""
        let dateFormatter = DateFormatter()
        dateFormatter.dateFormat =  "yyyy-MM-dd'T'HH:mm:ssZ"
        if let date = dateFormatter.date(from: startTimeString) {
          calculateTime(startWith: date)
        } else {
            print("Failed to convert string to date.")
        }
        
      }
    }
  }
  
  private func updateMapViewWithPolylines(with polylines: GMSMutablePath) {
    let polyline = GMSPolyline(path: polylines)
    polyline.strokeColor = .blue
    polyline.strokeWidth = 12
    polyline.map = mapView
  }
  
  private func fillActivityDetails() {
    startButton.isHidden = true
    workoutDetailsView.isHidden = false
    workoutTimeLabel.text = contract?.activityDetails?.duration
    totalDistanceLabel.text = "\(String(describing: contract?.activityDetails?.length))"
    averageSpeedLabel.text = "\( String(describing: contract?.activityDetails?.averageSpeed))"
  }
  
  
  private func convertContractIntoActivity(with contract: [String:Any]) {
    do {
      let jsonData = try JSONSerialization.data(withJSONObject: contract, options: [])
      let activity = try JSONDecoder().decode(Activity.self, from: jsonData)
      self.contract = activity
      self.isLive = self.contract?.isLive
      self.currentlyGoingOn = self.contract?.currentlyGoingOn
    } catch {
      print("Failed to decode JSON: \(error)")
    }
  }
  
  required init?(coder: NSCoder) {
    fatalError("init(coder:) has not been implemented")
  }
  
  func initGoogleMapView(_ lat: CLLocationDegrees , _ long: CLLocationDegrees) {
    startButton.addTarget(self, action: #selector(startBtnClicked), for: .touchUpInside)
    stopButton.addTarget(self, action: #selector(stopBtnClicked), for: .touchUpInside)
    let options = GMSMapViewOptions()
    options.camera = GMSCameraPosition(latitude:  lat, longitude: long, zoom: 16 , bearing: 90 , viewingAngle: 45)
    options.frame = CGRect(x: 0, y: 0, width: self.view.bounds.width, height: self.view.bounds.height/1.5)
    let mapView = GMSMapView(options:options)
    let position = CLLocationCoordinate2D(latitude: lat, longitude: long)
    let marker = GMSMarker(position: position)
    marker.appearAnimation = .pop
    mapView.isBuildingsEnabled = false
    self.mapView = mapView
    marker.map = self.mapView
    self.view.addSubview(self.mapView)
  }
  
  func didUpdateLocation(lat: CLLocationDegrees, long: CLLocationDegrees) {
    if myLat == nil && myLong == nil {
      myLat = lat
      myLong = long
      initGoogleMapView(lat , long)
      locationManager.stopUpdatingLocation()
      return
    }
    let newLocation = CLLocation(latitude: lat, longitude: long)
    let previousLocation = CLLocation(latitude: myLat, longitude: myLong)
    let distance = newLocation.distance(from: previousLocation)
    
    if distance < 20 {
      return
    }
    addTotalDistance(prevLocation: CLLocation(latitude: myLat, longitude: myLong), newLocation: CLLocation(latitude: lat, longitude: long))
    myLat = lat
    myLong = long
    activityPath.add(CLLocationCoordinate2D(latitude: lat, longitude: long))
    updateMapViewWithPolylines(with: self.activityPath)
  }
  
  @objc func startBtnClicked() {
    locationManager.startUpdatingLocation()
    startButton.isHidden = true
    workoutDetailsView.isHidden = false
    stopButton.isHidden = false
    calculateTime()
    let dateFormatter = DateFormatter()
    dateFormatter.dateFormat =  "yyyy-MM-dd'T'HH:mm:ssZ"
    let dateString = dateFormatter.string(from: startTime ?? Date())
    self.contract?.activityDetails = SubActivity(startTime: dateString)
    RNEventEmitter.emitter.sendEvent(withName: "onStartWorkout", body: self.contract?.toDictionary())
  }
  
  @objc func stopBtnClicked() {
    locationManager.stopUpdatingLocation()
    stopButton.isHidden = true
    startButton.isHidden = false
    timer?.invalidate()
    timer = nil
    self.contract?.isLive = false
    let dateFormatter = DateFormatter()
    dateFormatter.dateFormat =  "yyyy-MM-dd'T'HH:mm:ssZ"
    let dateString = dateFormatter.string(from: Date())
    self.contract?.activityDetails?.endTime = dateString
    RNEventEmitter.emitter.sendEvent(withName: "onEndWorkout", body: self.contract?.toDictionary())
  }
  
  
  func calculateTime(startWith: Date? = nil) {
    if let startWith = startWith {
      startTime = startWith
    } else {
      startTime = Date()
    }
    
    timer = Timer.scheduledTimer(withTimeInterval: 1.0, repeats: true, block: {[weak self] _ in
      guard let self = self, let startTime = self.startTime else { return }
      self.totalTime = Date().timeIntervalSince(startTime)
      let timeString = self.formatTime(self.totalTime)
      self.contract?.activityDetails?.duration = timeString
      DispatchQueue.main.async {
        self.workoutTimeLabel.text = "Time: \(timeString)"
      }    })
  }
  
  func formatTime(_ timeInterval: TimeInterval) -> String {
    let totalSeconds = Int(timeInterval)
    let hours = totalSeconds / 3600
    let minutes = (totalSeconds % 3600) / 60
    let seconds = totalSeconds % 60
    return String(format: "%02d:%02d", minutes, seconds)
  }
  
  func distanceToString(distance: CLLocationDistance) -> String {
      // Create a Measurement object with the distance in meters
    let distanceMeasurement = Measurement(value: distance/1000, unit: UnitLength.kilometers)
      
      // Create a MeasurementFormatter for localization and formatting
      let formatter = MeasurementFormatter()
      formatter.unitOptions = .providedUnit // Automatically pick km or m
      formatter.unitStyle = .medium // Adjusts formatting style (full, medium, short)
      formatter.locale = Locale.current // Use the user's current locale
      
      // Convert distance to a string
      return formatter.string(from: distanceMeasurement)
  }
  
  func addTotalDistance(prevLocation: CLLocation , newLocation: CLLocation) {
    totalDistance +=  prevLocation.distance(from: newLocation)
    self.contract?.activityDetails?.length = "Total Run:  \( self.distanceToString(distance: self.totalDistance)) "
    
    if let coordinates = self.contract?.activityDetails?.coordinates {
      self.contract?.activityDetails?.coordinates?.append(UserCoordinate(lat: prevLocation.coordinate.latitude , long: prevLocation.coordinate.longitude))
    } else {
      let coordinates = [UserCoordinate(lat: prevLocation.coordinate.latitude , long: prevLocation.coordinate.longitude)]
      self.contract?.activityDetails?.coordinates = coordinates
    }
    DispatchQueue.main.async {
      self.totalDistanceLabel.text = "Total Run:  \( self.distanceToString(distance: self.totalDistance)) "
    }
  }
  
  func updateAverageSpeed() {
    self.contract?.activityDetails?.averageSpeed = "Avg. Speed: \(String(format:"%.2f" , totalDistance/totalTime)) m/s"
    RNEventEmitter.emitter.sendEvent(withName: "onStartWorkout", body: self.contract?.toDictionary())
    averageSpeedLabel.text = "Avg. Speed: \(String(format:"%.2f" , totalDistance/totalTime)) m/s"
  }

}

extension GoogleMapViewViewController {
  
  func addSubviews() {
    self.view.addSubview(startButton)
    self.view.addSubview(stopButton)
    self.view.addSubview(workoutDetailsView)
    workoutDetailsView.addSubview(workoutTimeLabel)
    workoutDetailsView.addSubview(totalDistanceLabel)
    workoutDetailsView.addSubview(averageSpeedLabel)
    configureConstraints()
  }
  
  func configureConstraints() {
    
    let startBtnCons = [
      startButton.centerXAnchor.constraint(equalTo: self.view.centerXAnchor), // Center horizontally
      startButton.bottomAnchor.constraint(equalTo: self.view.safeAreaLayoutGuide.bottomAnchor, constant: -20), // 20 points from the bottom
      startButton.leadingAnchor.constraint(equalTo: self.view.leadingAnchor, constant: 16),
      startButton.trailingAnchor.constraint(equalTo: self.view.trailingAnchor, constant: -16),
      startButton.heightAnchor.constraint(equalToConstant: 50)
    ]
    
    let stopBtnCons = [
      stopButton.centerXAnchor.constraint(equalTo: self.view.centerXAnchor), // Center horizontally
      stopButton.bottomAnchor.constraint(equalTo: self.view.safeAreaLayoutGuide.bottomAnchor, constant: -20), // 20 points from the bottom
      stopButton.leadingAnchor.constraint(equalTo: self.view.leadingAnchor, constant: 16),
      stopButton.trailingAnchor.constraint(equalTo: self.view.trailingAnchor, constant: -16),
      stopButton.heightAnchor.constraint(equalToConstant: 50)
    ]
    
    let workoutViewCons = [
      workoutDetailsView.leadingAnchor.constraint(equalTo: self.view.leadingAnchor, constant: 16),
      workoutDetailsView.trailingAnchor.constraint(equalTo: self.view.trailingAnchor, constant: -16),
      workoutDetailsView.bottomAnchor.constraint(equalTo: self.startButton.topAnchor, constant: -16)
    ]
    
    let workoutTimeLabelCons = [
      workoutTimeLabel.leadingAnchor.constraint(equalTo: workoutDetailsView.leadingAnchor, constant: 16),
      workoutTimeLabel.trailingAnchor.constraint(equalTo: workoutDetailsView.trailingAnchor, constant: -16),
      workoutTimeLabel.topAnchor.constraint(equalTo: workoutDetailsView.topAnchor, constant: 16),
      workoutTimeLabel.bottomAnchor.constraint(equalTo: totalDistanceLabel.topAnchor, constant: -16),
    ]
    
    let distanceLabelCons = [
      totalDistanceLabel.leadingAnchor.constraint(equalTo: workoutDetailsView.leadingAnchor, constant: 16),
      totalDistanceLabel.trailingAnchor.constraint(equalTo: workoutDetailsView.trailingAnchor, constant: -16),
      totalDistanceLabel.topAnchor.constraint(equalTo: workoutTimeLabel.bottomAnchor, constant: 16),
      totalDistanceLabel.bottomAnchor.constraint(equalTo: averageSpeedLabel.topAnchor, constant: -16),
    ]
    
    let averageSpeedLabel = [
      averageSpeedLabel.leadingAnchor.constraint(equalTo: workoutDetailsView.leadingAnchor, constant: 16),
      averageSpeedLabel.trailingAnchor.constraint(equalTo: workoutDetailsView.trailingAnchor, constant: -16),
      averageSpeedLabel.topAnchor.constraint(equalTo: totalDistanceLabel.bottomAnchor, constant: 16),
      averageSpeedLabel.bottomAnchor.constraint(equalTo: workoutDetailsView.bottomAnchor, constant: -16),
    ]
    
    NSLayoutConstraint.activate(startBtnCons)
    NSLayoutConstraint.activate(stopBtnCons)
    NSLayoutConstraint.activate(workoutViewCons)
    NSLayoutConstraint.activate(workoutTimeLabelCons)
    NSLayoutConstraint.activate(distanceLabelCons)
    NSLayoutConstraint.activate(averageSpeedLabel)

    
  }
}

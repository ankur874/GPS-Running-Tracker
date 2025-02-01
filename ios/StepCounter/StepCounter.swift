//
//  StepCounter.swift
//  fitnesstracker
//
//  Created by Ankur Attri on 28/01/25.
//

import CoreMotion
class StepCounter {
  private let pedometer = CMPedometer()
  var lastFourDays: [NSNumber] = []
  
  
  func fetchStepsForLastFourDays(completion: @escaping ([NSNumber]) -> Void) {
      guard CMPedometer.isStepCountingAvailable() else {
          print("Step counting is not available on this device.")
          return
      }
      
      self.lastFourDays = []
      let dispatchGroup = DispatchGroup()

      for day in 0..<4 {
          let startDate = Calendar.current.date(byAdding: .day, value: -(day + 1), to: Calendar.current.startOfDay(for: Date()))!
          let endDate = Calendar.current.date(byAdding: .day, value: -day, to: Calendar.current.startOfDay(for: Date()))!
          
          dispatchGroup.enter()
          
          pedometer.queryPedometerData(from: startDate, to: endDate) { data, error in
              guard let pedometerData = data, error == nil else {
                  print("Error fetching pedometer data for \(startDate): \(error?.localizedDescription ?? "Unknown error")")
                  dispatchGroup.leave()
                  return
              }

              DispatchQueue.main.async {
                  self.lastFourDays.append(pedometerData.numberOfSteps)
              }
              
              dispatchGroup.leave()
          }
      }

      dispatchGroup.notify(queue: .main) {
          // Once all async calls are finished, the array will be populated
          completion(self.lastFourDays)
      }
  }

  
  func stopStepUpdates() {
    pedometer.stopUpdates()
  }
}

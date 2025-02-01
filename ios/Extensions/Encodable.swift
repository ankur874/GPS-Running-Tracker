//
//  Encodable.swift
//  fitnesstracker
//
//  Created by Ankur Attri on 25/01/25.
//

extension Encodable {
  func toDictionary() -> [String: Any]? {
    do {
      let data = try JSONEncoder().encode(self)
      let dictionary = try JSONSerialization.jsonObject(with: data, options: []) as? [String: Any]
      return dictionary
    } catch {
      print("Error converting to dictionary: \(error)")
      return nil
    }
  }
}


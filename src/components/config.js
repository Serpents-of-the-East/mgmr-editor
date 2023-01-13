const config = {
  objects: {
    Wall: {
      code: 1,
      name: 'Wall',
      color: '#000000'
    },
    Floor: {
      code: 2,
      name: 'Floor',
      color: '#808080'
    },
    Purple: {
      code: 3,
      name: 'Purple',
      color: '#A020F0'
    },
    Grey: {
      code: 4,
      name: 'Grey',
      color: '#808080'
    },
    Green: {
      code: 5,
      name: 'Green',
      color: '#00FF00'
    },
    Blue: {
      code: 6,
      name: 'Blue',
      color: '#0000FF'
    },
    Red: {
      code: 7,
      name: 'Red',
      color: '#FF0000'
    },
    Brown: {
      code: 8,
      name: 'Brown',
      color: '#964B00'
    },
    Yellow: {
      code: 9,
      name: 'Yellow',
      color: '#FFFF00'
    },
    Grass: {
      code: 10,
      name: 'Grass',
      color: '#009A17'
    },
    Flower: {
      code: 11,
      name: 'Flower',
      color: '#483d8b'
    },
    Black: {
      code: 12,
      name: 'Black',
      color: '#333333'
    },
    White: {
      code: 13,
      name: 'White',
      color: '#ffffff'
    },
    Word: {
      code: 41,
      name: 'Word',
      color: '#483d8b'
    },
  },
  objectsText: {
    I: {
      code: 40,
      name: 'I',
      color: '#0047AB'
    },
    Word: {
      code: 41,
      name: 'Word',
      color: '#0047AB'
    },
    Wall: {
      code: 42,
      name: 'Wall',
      color: '#0047AB'
    },
    Floor: {
      code: 43,
      name: 'Floor',
      color: '#0047AB'
    },
    Purple: {
      code: 44,
      name: 'Purple',
      color: '#0047AB'
    },
    Grey: {
      code: 45,
      name: 'Grey',
      color: '#0047AB'
    },
    Green: {
      code: 46,
      name: 'Green',
      color: '#0047AB'
    },
    Blue: {
      code: 47,
      name: 'Blue',
      color: '#0047AB'
    },
    Red: {
      code: 48,
      name: 'Red',
      color: '#0047AB'
    },
    Brown: {
      code: 49,
      name: 'Brown',
      color: '#0047AB'
    },
    Yellow: {
      code: 50,
      name: 'Yellow',
      color: '#0047AB'
    },
    Grass: {
      code: 51,
      name: 'Grass',
      color: '#0047AB'
    },
    Flower: {
      code: 52,
      name: 'Flower',
      color: '#0047AB'
    },
    Black: {
      code: 53,
      name: 'Black',
      color: '#0047AB'
    },
    White: {
      code: 54,
      name: 'White',
      color: '#0047AB'
    },
  },
  verbs: {
    is: {
      code: 60,
      name: 'is',
      color: '#0047AB'
    },
    am: {
      code: 61,
      name: 'am',
      color: '#0047AB'
    },
    can: {
      code: 62,
      name: 'can',
      color: '#0047AB'
    },
    and: {
      code: 63,
      name: 'and',
      color: '#0047AB'
    },
  },
  properties: {
    Goal: {
      code: 76,
      name: 'Goal',
      color: '#0047AB'
    },
    Climb: {
      code: 70,
      name: 'Climb',
      color: '#0047AB'
    },
    Float: {
      code: 71,
      name: 'Float',
      color: '#0047AB'
    },
    Hot: {
      code: 72,
      name: 'Hot',
      color: '#0047AB'
    },
    Send: {
      code: 80,
      name: 'Send',
      color: '#0047AB'
    },
    Stop: {
      code: 73,
      name: 'Stop',
      color: '#0047AB'
    },
    Push: {
      code: 74,
      name: 'Push',
      color: '#0047AB'
    },
    Pull: {
      code: 75,
      name: 'Pull',
      color: '#0047AB'
    },
    Water: {
      code: 77,
      name: 'Water',
      color: '#0047AB'
    },
    Chill: {
      code: 78,
      name: 'Chill',
      color: '#0047AB'
    },
    Steep: {
      code: 79,
      name: 'Steep',
      color: '#0047AB'
    },
  },
  b_colors: {
    b_white: {
      code: 13,
      name: 'B_White',
      color: '#ffffff'
    },
    b_purple: {
      code: 14,
      name: 'B_Purple',
      color: '#A020F0'
    },
    b_grey: {
      code: 15,
      name: 'B_Grey',
      color: '#808080'
    },
    b_green: {
      code: 16,
      name: 'B_Green',
      color: '#00FF00'
    },
    b_blue: {
      code: 17,
      name: 'B_Blue',
      color: '#0000FF'
    },
    b_red: {
      code: 18,
      name: 'B_Red',
      color: '#FF0000'
    },
    b_brown: {
      code: 19,
      name: 'B_Brown',
      color: '#964B00'
    },
    b_yellow: {
      code: 20,
      name: 'B_Yellow',
      color: '#FFFF00'
    },
  },
}

export const reverseLookup = (() => {
  const current = {};
  for (let category of Object.keys(config)) {
    for (let item of Object.keys(config[category])) {
      const currentObject = config[category][item];
      current[currentObject.code] = currentObject;
    }
  }
  return current
})();

export default config
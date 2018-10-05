var hash = {
  "types":[
{"name":"無", "description":"無属性", "isCountable":false,"attackRateMatrix":[1,1,  1,  1,  1  ]}, 
{"name":"緑", "description":"緑属性", "isCountable":true, "attackRateMatrix":[1,1,  0.5,1,  1.5]}, 
{"name":"赤", "description":"赤属性", "isCountable":true, "attackRateMatrix":[1,1.5,1  ,0.5,1  ]}, 
{"name":"青", "description":"青属性", "isCountable":true, "attackRateMatrix":[1,1,  1.5,1  ,0.5]}, 
{"name":"黒", "description":"黒属性", "isCountable":true, "attackRateMatrix":[1,0.5,1,  1.5,1  ]}
  ],
  "subtypes":[
{"name":"男性", "description":"男性"}, 
{"name":"女性", "description":"女性"}, 
{"name":"無性別", "description":"無性別"}
  ],
  "rarities":[
{"name":"C", "description":"コモン"},
{"name":"UC", "description":"アンコモン"},
{"name":"R", "description":"レア"},
{"name":"R+", "description":"レア+"},
{"name":"SR", "description":"Sレア"},
{"name":"SR+", "description":"Sレア+"},
{"name":"UR", "description":"Uレア"},
{"name":"UR+", "description":"Uレア+"}
  ],
  "packages":[
{"name":"1", "description":"第1弾 オリンポス 覇王覚醒"},
{"name":"1ex", "description":"ET1弾 古のオリンポス"}
  ],


  "deckEffects":{
"1":{
  "properties":{
    "name":"2色混成",
    "trigger":"firstturn",
    "conditionType":"typecount",
    "conditionValue":2
  },
  "actions":[{
    "type":"spup",
    "range":0x001ff,
    "isRangeAbs":true,
    "hasSideAtk":false,
    "valBase":"zero",
    "valConst":1
  }]
},
"2":{
  "properties":{
    "name":"3色混成",
    "trigger":"firstturn",
    "conditionType":"typecount",
    "conditionValue":3
  },
  "actions":[{
    "type":"spup",
    "range":0x001ff,
    "isRangeAbs":true,
    "hasSideAtk":false,
    "valBase":"zero",
    "valConst":2
  }]
},
"3":{
  "properties":{
    "name":"4色混成",
    "trigger":"firstturn",
    "conditionType":"typecount",
    "conditionValue":4
  },
  "actions":[{
    "type":"spup",
    "range":0x001ff,
    "isRangeAbs":true,
    "hasSideAtk":false,
    "valBase":"zero",
    "valConst":3
  }]
}
  },


  "cards":{
"84":{
  "id":"84",
  "properties":{
    "name":"ポセイドン",
    "metadata":{"kana":"ポセイドン"},
    "package":0,"regulatoin":0,"rarity":4,
    "type":3,"subtype":0,
    //"imgurl":"http://4.bp.blogspot.com/-UF7en7rKBlA/WOdD7bpDe6I/AAAAAAABDm8/cqFlIykomQUXr6GCMGvcNJ91XCW9yl6UQCLcB/s800/shinwa_poseidon.png",
    "cost" : 5,
    "hp" : 20,
    "ag" : 20,
    "at" : 10,
    "sp" : 5,
  },
  "abilities" : {
  },
  "skills" : {
    "front":{
      "properties":{
        "name":"フロントテスト"
      },
      "actions":[{
        "type":"attack",
        "range":0x00e00,
        "isRangeAbs":true,
        "hasSideAtk":false,
        "valRatio":0.5
      }]
    },
    "support":{
      "properties":{
        "name":"support test"
      },
      "actions":[{
        "type":"attack",
        "range":0x12400,
        "isRangeAbs":false,
        "hasSideAtk":true,
        "valRatio":0.4
      }]
    },
    "back":{
      "properties":{
        "name":"BACK"
      },
      "actions":[{
        "type":"attack",
        "range":0x3f000,
        "isRangeAbs":false,
        "hasSideAtk":true,
        "valRatio":0.3
      }]
    },
    "special":{
      "properties":{
        "name":"特技テスト"
      },
      "actions":[{
        "type":"attack",
        "range":0x3fe00,
        "isRangeAbs":true,
        "hasSideAtk":false,
        "valRatio":1.0
      }]
    },
  }
}
  },



  "abilities":{
"1":{
  "properties":{
    "name":"神速3",
    "trigger":"firstturn",
    "conditionType":"always",
    "conditionValue":0
  },
  "actions":[{
    "type":"agup",
    "range":0x00010,
    "isRangeAbs":false,
    "hasSideAtk":false,
    "valBase":"zero",
    "valConst":30
  }]
}
  },



  "specialMoves":{
"1":{
  "properties":{
    "name" : "復活の祈り",
    "turnRangeMin" : 2,
    "turnRangeMax" : 20,
    "turns" : 1
  },
  "actions":[{
    "type":"rebirth",
    "range":0x001ff,
    "isRangeAbs":true,
    "hasSideAtk":false,
    "valBase":"zero",
    "valConst":50
  }]
},
"2":{
  "properties":{
    "name" : "天空の裁き",
    "turnRangeMin" : 6,
    "turnRangeMax" : 20,
    "turns" : 5
  },
  "actions":[{
    "type":"attack",
    "range":0x3fe00,
    "isRangeAbs":true,
    "hasSideAtk":false,
    "valBase":"zero",
    "valConst":70
  }]
}

  }
}

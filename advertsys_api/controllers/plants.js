var mongoose = require('mongoose');
var Plant = mongoose.model('Plant');

var sendJSONresponse = function (res, status, content) {
  res.status(status);
  res.json(content);
};

var updateCurrentGrow = function (okigreenmem) {
  Plant
    .find({ okigreenMem: okigreenmem })
    .select('veges')
    .exec( function (err, grow) {
      if (!err) {
        if (grow.veges && grow.veges.length > 0) {
          var i, vegesCount, vegType;
          vegesCount = grow.veges.length;

          for (i = 0; i < vegesCount; i++) {
            if (grow.isGrowing == true) {
              vegType = grow.vegType;
            }
          }
        grow.currentlyGrowing = vegType;
        grow.save( function (err) {
          if (err) {
            console.log(err);
          } else {
            console.log("OKiGreen is now growing", vegType);
          }
        });
        }
      }
    });
}

var addPlant = function (req, res, plant) {
  if (!plant) {
    sendJSONresponse(res, 404, "growid not found");
  } else {
    plant.veges.push({
      vegType: req.body.vegetable,
      tempRequirements: req.body.temperature,
      waterRequirements: req.body.water,
      maturityPeriod: req.body.mature,
      isGrowing: false,
      growComment: req.body.comment
    });
    plant.save(function(err, plant) {
      var thisPlant;
      if (err) {
        sendJSONresponse(res, 400, err);
      } else {
        //updateAverageRating(location._id);
        //thisPlant = plant.veges[plant.veges.length - 1];
        sendJSONresponse(res, 201, plant);
      }
    });
  }
  
}

module.exports.plantsCreate = function (req, res) {
	Plant.create({
    currentlyGrowing: req.body.growthis,
    startGrowing: new Date(),
    okigreenMem: 'okigreenmem',
    veges: [{
      vegType: req.body.vegetable,
      tempRequirements: req.body.temperature,
      waterRequirements: req.body.water,
      maturityPeriod: req.body.mature,
      isGrowing: false,
      growComment: req.body.comment
    }]
  }, function(err, plant) {
    if (err) {
      console.log(err);
      sendJSONresponse(res, 400, err);
    } else {
      console.log(plant);
      sendJSONresponse(res, 201, plant);
    }
  });
}

module.exports.plantsAdd = function (req, res) {
   if (req.params.growid) {
      Plant
        .findById(req.params.growid)
        .select('veges')
        .exec(
          function(err, plant) {
            if (err) {
              sendJSONresponse(res, 400, err);
            } else {
              addPlant(req, res, plant);
            }
          }
        );
    } else {
      sendJSONresponse(res, 404, {
        "message": "Not found, growid required"
      });
    }
}

module.exports.plantsGrowUpdate = function (req, res) {
	Plant
    .findById(req.params.growid)
    //.select('veges')
    .exec( function (err, grow) {
      var thisOkigreen;
      // if (grow.veges && grow.veges.length > 0) {
      //   thisCrop = grow.veges.vegType(req.body.vegetable);
      //   if (!thisCrop) {
      //     sendJSONresponse(res, 404, {
      //       "message": "vegetable not found"
      //     });
      //   } else {
          thisOkigreen.currentlyGrowing = req.body.vegetable;
          thisOkigreen.startGrowing = new Date.now();

          grow.save( function (err, grow) {
            if (err) {
              sendJSONresponse(res, 404, err);
            } else {
              //updateCurrentGrow(grow.okigreenmem);
              sendJSONresponse(res, 200, thisOkigreen);
            }
          });
        //}
      // } else {
      //   sendJSONresponse(res, 404, {
      //     "message": "Growing not updated"
      //   });
      // }
      }
    );
}

module.exports.plantsGrowRead = function (req, res) {
	Plant
    .find()
    //.select('veges')
    .exec(
      function(err, plant) {
        if (err) {
          sendJSONresponse(res, 400, err);
        } else {
          sendJSONresponse(res, 200, plant);
        }
      }
    );
}

module.exports.plantsDelete = function (req, res) {
  var cropid = req.params.cropid;
  if (cropid) {
    Plant
      .findByIdAndRemove(cropid)
      .exec(
        function(err, plant) {
          if (err) {
            console.log(err);
            sendJSONresponse(res, 404, err);
            return;
          }
          console.log("Crop id " + cropid + " deleted");
          sendJSONresponse(res, 204, null);
        }
    );
  } else {
    sendJSONresponse(res, 404, {
      "message": "No cropid"
    });
  }
}

var mongoose = require('mongoose');
var Ad = mongoose.model('Adverts');
var moment = require('moment');

var sendJSONresponse = function(res, status, content) {
  res.status(status);
  res.json(content);
};

/* POST a new review, providing a locationid */
/* /api/locations/:locationid/reviews */
module.exports.createAdvert = function(req, res) {
  if (!req.body.adname || !req.body.adtime || !req.body.adkeywords) {
    sendJSONresponse(res, 400, {
      "message": "All fields required"
    });
    return;
  }

  var advert = new Ad();
  var starttime = moment();

  advert.adname = req.body.adname;
  advert.adtime = req.body.adtime;
  advert.adkeywords = req.body.adkeywords;
  advert.starttime = starttime;

  advert.save(function (err, advert) {
    if (err) {
      console.log(err);
      sendJSONresponse(res, 400, err);
    } else {
      console.log(advert);
      sendJSONresponse(res, 201, advert);
    }
  });
};

module.exports.retrieveAdverts = function (req, res) {
  Ad
    .find()
    .select('adname adtime adkeywords starttime')
    .exec(function (err, adverts) {
        if (err) {
          sendJSONresponse(res, 400, err);
        } else {
          sendJSONresponse(res, 200, adverts);
        }
      }
    );
}

module.exports.readOneAdvert = function(req, res) {
  console.log("Getting single advert");
  if (req.params && req.params.advertid) {
    Ad
      .findById(req.params.advertid)
      .select('adname adtime adkeywords starttime')
      .exec(
        function(err, advert) {
          var response, advert;
          if (!advert) {
            sendJSONresponse(res, 404, {
              "message": "advertid not found"
            });
            return;
          } else if (err) {
            sendJSONresponse(res, 400, err);
            return;
          } else {
            response = {
              advert: {
                adname: advert.adname,
                timing: advert.adtime,
                //id: req.params.advertid,
                keywords: advert.adkeywords,
                starttime: advert.starttime
              }
            };
            sendJSONresponse(res, 200, response);
          }
        }
      );
  } else {
    sendJSONresponse(res, 404, {
      "message": "Not found, advertid is required"
    });
  }
};

module.exports.updateOneAdvert = function(req, res) {
  if (!req.params.advertid) {
    sendJSONresponse(res, 404, {
      "message": "Not found, advertid is required"
    });
    return;
  }
  Ad
    .findById(req.params.advertid)
    .select('adname adtime adkeywords starttime')
    .exec(
      function(err, advert) {
        var starttime = moment();
        if (!advert) {
          sendJSONresponse(res, 404, {
            "message": "advertid not found"
          });
          return;
        } else if (err) {
          sendJSONresponse(res, 400, err);
          return;
        }
        // if (advert.length > 0) {
        //   thisAdvert = adverts.id(req.params.advertid);
          // if (!thisAdvert) {
          //   sendJSONresponse(res, 404, {
          //     "message": "advertid not found"
          //   });
          // } 
          else {
            advert.adname = req.body.adname;
            advert.adtime = req.body.adtime;
            advert.adkeywords = req.body.adkeywords.split(",");
            advert.starttime = starttime;
            advert.save( function(err, thisAdvert) {
              if (err) {
                sendJSONresponse(res, 404, err);
              } else {
                //updateAverageRating(advert._id);
                sendJSONresponse(res, 200, thisAdvert);
              }
            });
          }
        // } else {
        //   sendJSONresponse(res, 404, {
        //     "message": "No advert to update"
        //   });
        // }
      }
  );
};

// app.delete('/api/locations/:locationid/reviews/:reviewid'
module.exports.deleteOneAdvert = function(req, res) {
  var advertid = req.params.advertid;
  if (advertid) {
  Ad
    .findByIdAndRemove(advertid)
    //.select('adverts')
    .exec(function (err, advert) {
      if (err) {
        sendJSONresponse(res, 404, err);
        return;
      }
      sendJSONresponse(res, 204, {
        "message": "Advert successfully removed"
      });
    }); 
  } else {
    sendJSONresponse(res, 200, {
      "message": "No advertid"
    });
  }
};

///////////////////////////////////////////////////////////////

// var doAddReview = function(req, res, location) {
//   if (!location) {
//     sendJSONresponse(res, 404, "locationid not found");
//   } else {
//     location.reviews.push({
//       author: req.body.author,
//       rating: req.body.rating,
//       reviewText: req.body.reviewText
//     });
//     location.save(function(err, location) {
//       var thisReview;
//       if (err) {
//         sendJSONresponse(res, 400, err);
//       } else {
//         updateAverageRating(location._id);
//         thisReview = location.reviews[location.reviews.length - 1];
//         sendJSONresponse(res, 201, thisReview);
//       }
//     });
//   }
// };

// var updateAverageRating = function(locationid) {
//   console.log("Update rating average for", locationid);
//   Loc
//     .findById(locationid)
//     .select('reviews')
//     .exec(
//       function(err, location) {
//         if (!err) {
//           doSetAverageRating(location);
//         }
//       });
// };

// var doSetAverageRating = function(location) {
//   var i, reviewCount, ratingAverage, ratingTotal;
//   if (location.reviews && location.reviews.length > 0) {
//     reviewCount = location.reviews.length;
//     ratingTotal = 0;
//     for (i = 0; i < reviewCount; i++) {
//       ratingTotal = ratingTotal + location.reviews[i].rating;
//     }
//     ratingAverage = parseInt(ratingTotal / reviewCount, 10);
//     location.rating = ratingAverage;
//     location.save(function(err) {
//       if (err) {
//         console.log(err);
//       } else {
//         console.log("Average rating updated to", ratingAverage);
//       }
//     });
//   }
// };

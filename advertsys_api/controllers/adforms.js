var express = require('express'),
    fs      = require('fs'),
    multer  = require('multer'),
    mime    = require('mime'),
    path    = require('path'),
    crypto  = require("crypto"),
    Form    = require('../models/picads'),
    Company = require('../models/companies'),
    Link    = require('../models/links'),
    Textad    = require('../models/textads'),
    gm      = require('gm');

// this process does not hang the nodejs server on error
process.on('uncaughtException', function (err) {
  console.log(err);
});

// setting up multer
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    var dest = 'public/uploads/forms/' + req.company._id;  // i know, i should use dirname blah blah :)
    var stat = null;
    try {
      stat = fs.statSync(dest);
      console.log(dest);
    }
    catch (err) {
      fs.mkdirSync(dest);
    }
    if (stat && !stat.isDirectory()) {
      throw new Error('Directory cannot be created because an inode of a different type exists at "' + dest + '"');
    }
    cb(null, dest)
  },
  filename: function (req, file, cb) {
    //if you want even more random characters prefixing the filename then change the value '2' below as you wish, right now, 4 charaters are being prefixed
    crypto.pseudoRandomBytes(2, function (err, raw) {
      cb(null, raw.toString('hex') + '.' + file.originalname.toLowerCase());
    });
  }
});

// telling multer what storage we want and filefiltering to check if file is an image, the 'parts' property declares how many fields we are expecting from front end
var upload = multer({
  storage: storage,
  limits: {
    fileSize: 5000000, // 5MB filesize limit
    parts: 3
  },
  fileFilter: function (req, file, cb) {
    var filetypes = /jpe?g|png|gif/;
    var mimetype  = filetypes.test(file.mimetype);
    var extname   = filetypes.test(path.extname(file.originalname).toLowerCase());
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb("Error: File upload only supports the following filetypes - " + filetypes);
  }
}).single('fileUp');

// posting the form with the image to server, CAUTION: the 'fileUp' MUST match the name in our file input 'name' attribute ex. name="fileUp"


module.exports.newAd = function (req, res) {
  upload(req, res, function (err) {
    if (err) {
      return res.status(500).json({
        message: 'There was an error',
        error: err
      });
    }

    // finding the user who initialized the upload from front end
    Company.findById(req.company._id, function (err, company) {
      if (err) {
        return res.status(500).json({
          title: 'An error occured',
          err: err
        });
      }
      // setting our new form to be saved in database, we fetch the data from the front end,
      // req.file.path is coming from multer, we need that value to store the path to database
      // at the end we assinging the owner of the form by passing the user _id to the form
      // in the backend we are referencing each form to the user who uploaded it
      // so later on we can display the data in the front end
      // console.log(req.file);
      // resize middleware, just change 400 to whatever you like, the null parameter maintains aspect ratio, if you want exact dimensions replace null with a height number as you wish
      gm(req.file.path)
        // .resize('300', '300')
        // .gravity('Center')
        // .crop('300', '300')
        .noProfile()
        .write(req.file.path, function (err) {
          if (err) {
            console.log(err);
            fs.unlink(req.file.path);
            // });// this will result a 404 when frontend tries to access the image, I ll provide a fix soon
          }
        });

      var form = new Form({
        topic: req.body.topic,
        url: req.body.url,
        imagePath: req.file.filename,
        owner: company._id
      });

      form.save(function (err, result) {
        if (err) {
          return res.status(404).json({
            message: 'There was an error, please try again',
            err: err
          });
        }
        company.forms.push(result);
        company.save();
        res.status(201).json({
          message: 'Form Saved Successfully',
          obj: result
        });
      });
    })
  });
};

module.exports.retrieveAds = function (req, res) {
  Company.findById(({_id: req.company._id}), function (err, company) {
    if (err) {
      return res.status(404).json({
        message: 'No forms found for this user',
        err: err
      })
    }
    else {
      Form.find(({owner: req.company._id}), function (err, forms) {
        if (err) {
          return res.status(404).json({
            message: 'An error occured',
            err: err
          })
        }
        res.status(200).json({
          message: 'Success',
          forms: forms
        });
      })
    }
  })
};

module.exports.getCompany = function (req, res) {
  Company.findById(({_id: req.company._id}), function (err, company) {
    if (err) {
      return res.status(404).json({
        message: 'No such Company',
        err: err
      })
    }
    res.status(200).json({
      company: company.name
    });
  })
};

module.exports.readSingleAd = function (req, res, err) {
  console.log(req.params);
  Form.findById((req.params.id), function (err, form) {
    if (err) {
      return res.status(500).json({
        message: 'An error occured',
        err: err
      })
    }
    if (!form) {
      return res.status(404).json({
        title: 'No form found',
        error: {message: 'Form not found!'}
      });
    }
    // checking if the owner of the form is correct
    // if (form.owner != req.company._id.toString()) {
    //   return res.status(401).json({
    //     title: 'Not your form!',
    //     error: {message: 'Users do not match, not your form'}
    //   });
    // }
    res.status(200).json({
      obj: form
    });
  });
};
// updating the form with new text fields values and image from front end
module.exports.editSingleAd = function (req, res, err) {
  upload(req, res, function (err) {
    if (err) {
      return res.status(500).json({
        status: 'There was an error, file size too big',
        error: err
      });
    }
    // check if the user has uploaded a new file, if he has, continue to image resize
    if (req.file != undefined) {
      gm(req.file.path)
        //.resize(400, null)
        .noProfile()
        .write(req.file.path, function (err) {
          if (err) {
            fs.unlink(req.file.path);  // this will result a 404 when frontend tries to access the image, I ll provide a fix soon
            console.log(err)
          }
        });
    }

    Form.findById((req.params.id), function (err, form) {
      if (err) {
        return res.status(500).json({
          message: 'An error occured',
          err: err
        })
      }
      if (!form) {
        return res.status(404).json({
          title: 'No form found',
          error: {message: 'Form not found!'}
        });
      }
      if (form.owner != req.company._id.toString()) {
        return res.status(401).json({
          title: 'Not your form!',
          error: {message: 'Users do not match, not your form'}
        });
      }
      // check if user has uploaded a new file, if he has, delete the old file
      if (req.file !== undefined) {
        fs.unlink('public/uploads/forms/' + form.owner + '/' + form.imagePath);
      }
      form.topic = req.body.topic;
      form.url = req.body.url;
      // check if the user has uploaded a new file, if he has, then store the image path to Mongo and replace the old one
      if (req.file !== undefined) {
        form.imagePath = req.file.filename;
      }

      form.save(function (err, result) {
        if (err) {
          return res.status(404).json({
            message: 'There was an error, please try again',
            err: err
          });
        }
        res.status(201).json({
          message: 'Form Edited Successfully',
          obj: result
        });
      });
    });
  });
};

module.exports.removeAd = function (req, res, err) {
  Form.findById((req.params.id), function (err, form) {

    if (err) {
      return res.status(500).json({
        message: 'An error occured',
        err: err
      })
    }
    if (!form) {
      return res.status(404).json({
        title: 'No form found',
        error: {message: 'Form not found!'}
      });
    }
    if (form.owner != req.company._id.toString()) {
      return res.status(401).json({
        title: 'Not your form!',
        error: {message: 'Users do not match'}
      });
    }
    // finding the owner of the form and deleting the form _id from the array 'forms'
    Company.findOneAndUpdate({'_id': req.company._id}, {$pull: {forms: req.params.id}}, {new: true}, function (err) {
      if (err) {
        return res.status(404).json({
          title: 'An error occured',
          error: err
        })
      }
    });
    // deleting the file associated with the form from the filesystem leaving the user's folder intact
    fs.unlink('public/uploads/forms/' + form.owner + '/' + form.imagePath);
    // deleting the form from the database
    form.remove(function (err, result) {
      if (err) {
        return res.status(500).json({
          title: 'An error occured',
          error: err
        });
      }
      res.status(200).json({
        message: 'Form is deleted',
        obj: result
      });
    })
  });
}

// module.exports.checkIt = function (req, res) {
//   console.log(req.params);
//   res.status(200).json({
//     message: req.params
//   });
// }

module.exports.addLinks = function (req, res) {
  console.log(req.body.link);
  var link = new Link({
    link: req.body.link.trim()
  });

  var newLink = new Link(link);

  newLink.save(function (err, link) {
    if (err) {
      return res.status(404).json({
        message: 'There was an error, please try again',
        err: err
      });
    }
    res.status(200).json({
      message: 'Link Saved Successfully',
      obj: link
    });
  });
}

module.exports.getLinks = function (req, res) {
  Link
     .find()
     //.select('-_id -updatedAt -dateSubmitted -__v')
     .exec(function (err, links) {
       if (err) {
         return res.status(404).json({
           message: 'There was an error, please try again',
           err: err
         });
       }
       return res.status(200).json({
         message: 'Request successful',
         links: links
       });
     });
}

module.exports.removeLinks = function (req, res) {
  Link
     .findByIdAndRemove(req.params.id)
     .exec(function (err, links) {
        if (err) {
          return res.status(500).json({
            title: 'An error occured',
            error: err
          });
        }
        res.status(200).json({
          message: 'Link deleted',
          obj: links
        });
     })
}

//////////////
// Text Ads //
//////////////

module.exports.addTexts = function (req, res) {

  var newTextAd = new Textad({
    title: req.body.title.trim(),
    message: req.body.message.trim()
  });

  //var newTextAd = new Textad(textAd);

  newTextAd.save(function (err, text) {
    if (err) {
      return res.status(404).json({
        message: 'There was an error, please try again',
        err: err
      });
    }
    res.status(200).json({
      message: 'Link Saved Successfully',
      obj: text
    });
  });
}

module.exports.getTexts = function (req, res) {
  Textad
     .find()
     //.select('-_id -updatedAt -dateSubmitted -__v')
     .exec(function (err, texts) {
       if (err) {
         return res.status(404).json({
           message: 'There was an error, please try again',
           err: err
         });
       }
       return res.status(200).json({
         message: 'Request successful',
         texts: texts
       });
     });
}

module.exports.removeTexts = function (req, res) {
  Textad
     .findByIdAndRemove(req.params.id)
     .exec(function (err, texts) {
        if (err) {
          return res.status(500).json({
            title: 'An error occured',
            error: err
          });
        }
        res.status(200).json({
          message: 'Link deleted',
          obj: texts
        });
     })
}

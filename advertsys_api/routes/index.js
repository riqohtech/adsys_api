var express = require('express');
var router = express.Router();
var jwt = require('express-jwt');
var auth = jwt({
	secret: process.env.JWT_SECRET,
	userProperty: 'company'
});
//const authCheck = require('../config/auth-check');

var ctrlUserAuth = require('../controllers/user-auth');
//var ctrlAdAuth = require('../controllers/advertiserauth');
var ctrlAdAuth = require('../controllers/ad-auth');
//var ctrlAdvert = require('../controllers/advertisements');
var ctrlAd = require('../controllers/adforms');

/**
 *  COMPANY ROUTES.
 */
// Company Authenitication
router.post('/company/signup', ctrlAdAuth.signup);
router.post('/company/login', ctrlAdAuth.login);
// Picture Adverts
router.post('/company/ads', auth, ctrlAd.newAd);
router.get('/company/ads', auth, ctrlAd.retrieveAds);
router.get('/company/ads/name', auth, ctrlAd.getCompany);
router.get('/company/ads/edit/:id', ctrlAd.readSingleAd);
router.patch('/company/ads/edit/:id', auth, ctrlAd.editSingleAd);
router.delete('/company/ads/:id', auth, ctrlAd.removeAd);
// Full page links
router.get('/company/links', ctrlAd.getLinks);
router.post('/company/links', ctrlAd.addLinks);
router.delete('/company/links/:id', ctrlAd.removeLinks);
// Full page links
router.get('/company/textads', ctrlAd.getTexts);
router.post('/company/textads', ctrlAd.addTexts);
router.delete('/company/textads/:id', ctrlAd.removeTexts);
// router.post('/company/advert', ctrlAdvert.createAdvert);
// router.get('/company/advert', ctrlAdvert.retrieveAdverts);
// router.get('/company/advert/:advertid', ctrlAdvert.readOneAdvert);
// router.put('/company/advert/:advertid', ctrlAdvert.updateOneAdvert);
// router.delete('/company/advert/:advertid', ctrlAdvert.deleteOneAdvert);

/**
 *  USER ROUTES.
 */
// User Authentication
router.post('/user/signup', ctrlUserAuth.signup);
router.post('/user/login', ctrlUserAuth.login);
// Get Users
//router.get('/user/users', ctrlAuth.getUsers);

module.exports = router;

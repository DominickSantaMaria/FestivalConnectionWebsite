const express = require('express');

const controller = require('../controllers/storyController');
const router = express.Router();
const {isLoggedIn,isAuthor, isGuest, isNotAuthor} = require('../middlewares/auth');
const {validateId, validateSignUp,validateLogin, validateResult} = require('../middlewares/validator');

//GET /stories: send all stories to the user
router.get('/', controller.index);

//GET /stories/new: send html form for creating a new story

router.get('/new',isLoggedIn,  controller.new);
// POST /stories: send create a new story 

router.post('/', isLoggedIn, controller.create);

//GET /stories/:id send details of story identified by id

router.get('/:id', controller.show);

//GET /stories/:id/edit send html for editing a story

router.get('/:id/edit',isLoggedIn, isAuthor,controller.edit);

//PUT /stories/:id update the story identified by ID

router.put('/:id', isLoggedIn, isAuthor, controller.update);

//DELETE /stories/:id delete the story identified by ID

router.delete('/:id',isLoggedIn, isAuthor, controller.delete);

router.post('/:id/rsvp', validateId, isLoggedIn, isNotAuthor, controller.editRsvp);

module.exports = router;

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const storySchema = new Schema({
    title: {type: String, required: [true, 'title is required']},
    author: {type: Schema.Types.ObjectId, ref:'User'},
    content: {type: String, required: [true, 'content is required'], minLength: [10, 'the details should have at least 10 characters']},
    category: {type: String, required: [true, 'category is required']},
    startTime: {type: String, required: [true, 'start time is required']},
    endTime: {type: String, required: [true, 'end time is required']},
    location: {type: String, required: [true, 'location is required']},
    host: {type: String, required: [true, 'host is required']}
},
{timestamps: true}
);
//collection name is stories in the database
module.exports = mongoose.model('Story', storySchema);






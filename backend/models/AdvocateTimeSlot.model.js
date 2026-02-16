const mongoose = require('mongoose')

const advocateTimeSlotSchema = new mongoose.Schema({
    advocateId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    date: {
        type: Date,
        required: true
    },
    startTime: {
        type: String,
        required: true
    },
    endTime: {
        type: String,
        required: true
    },
    isBooked: {
        type: Boolean,
        default: false
    }
}, { timestamps: true })

module.exports = mongoose.model('AdvocateTimeSlot', advocateTimeSlotSchema)
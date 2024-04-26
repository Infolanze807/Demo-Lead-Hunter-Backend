const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const RemoteleadDataSchema = new Schema({
    Title: { type: String, required: true },
    Description: { type: String, required: true },
    Level: { type: String, required: true },
    Job_Type: { type: String, required: true },
    Tags: { type: Schema.Types.Mixed, required: true },
    Duration: String,
    Hourly_Rate_Budget:String,
    Project_Budget: String,
    Link: String
}, { timestamps: true });

// // Define a virtual property to represent the formatted timestamp
// leadDataSchema.virtual('formattedCreatedAt').get(function() {
//     const now = new Date();
//     const createdAt = this.createdAt;

//     const diffInMs = now - createdAt;
//     const diffInDays = Math.floor(diffInMs / (1000   60  60 * 24));

//     if (diffInDays === 0) {
//         return 'Today';
//     } else if (diffInDays === 1) {
//         return '1d ago';
//     } else {
//         return `${diffInDays}d ago`;
//     }
// });

RemoteleadDataSchema.virtual('formattedCreatedAt').get(function() {
    const now = new Date();
    const createdAt = new Date(this.createdAt);

    // Set both dates to the start of the day to ignore time component
    now.setHours(0, 0, 0, 0);
    createdAt.setHours(0, 0, 0, 0);

    const diffInMs = now - createdAt;
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) {
        return 'Today';
    } else if (diffInDays === 1) {
        return '1d ago';
    } else {
        return `${diffInDays}d ago`;
    }
});

// Ensure virtual fields are included in JSON output
RemoteleadDataSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('RemoteLeadData', RemoteleadDataSchema);

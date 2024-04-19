const LeadData = require("../model/LeadData")


// Create a new lead
exports.createLead = async (req, res) => {
    try {
        const leadData = new LeadData(req.body);
        const savedData = await leadData.save();
        res.status(201).json(savedData);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};


// Get all leads
exports.getAllLeads = async (req, res) => {
    try {
        // const leads = await LeadData.find();
        const leads = await LeadData.find().sort({ createdAt: -1});
        res.status(200).json(leads);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


// Delete a lead by ID
exports.deleteLeadById = async (req, res) => {
    const id = req.params.id;
    try {
        const deletedLead = await LeadData.findByIdAndDelete(id);
        if (!deletedLead) {
            return res.status(404).json({ message: 'Lead not found' });
        }
        res.status(200).json({ message: 'Lead deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};



// Fetch leads by tag
exports.getLeadsByTag = async (req, res) => {
    let selectedtags;
    // Check if tags are provided in the request body
    if (req.query.tags && typeof req.query.tags === 'string') {
        // Split the string by comma and trim extra whitespace
        selectedtags = req.query.tags.split(',').map(tag => tag.trim());
    } else if (Array.isArray(req.query.tags)) {
        selectedtags = req.query.tags;
    } else {
        return res.status(400).json({ message: "Tags parameter is required as a non-empty array or comma-separated string" });
    }

    try {
        if (selectedtags.length === 0) {
            return res.status(400).json({ message: "Tags parameter is required as a non-empty array" });
        }

        // Construct a regex pattern to match any of the selected tags
        const regexPattern = selectedtags.map(tag => `\\b${tag}\\b`).join('|');
        const regex = new RegExp(regexPattern, 'i');

        // Find leads that contain any of the selected tags
        const leads = await LeadData.find({ tags: { $regex: new RegExp(selectedtags.join('|'), 'i') } });

        if (leads.length === 0) {
            return res.status(404).json({ message: `No leads found for the tag(s) "${selectedtags.join(', ')}"` });
        }

        res.status(200).json(leads);
    } catch (err) {
        console.error("Error fetching leads by tag:", err);
        res.status(500).json({ message: "An error occurred while fetching leads" });
    }
};

//Fetch leads by Platforms

exports.getLeadsByPlatform = async (req, res) => {
    let selectedPlatforms;
    // Check if platforms are provided in the request body
    if (req.body.platforms && typeof req.body.platforms === 'string') {
        // Split the string by comma and trim extra whitespace
        selectedPlatforms = req.body.platforms.split(',').map(platform => platform.trim());
    } else if (Array.isArray(req.body.platforms)) {
        selectedPlatforms = req.body.platforms;
    } else {
        return res.status(400).json({ message: "Platforms parameter is required as a non-empty array or comma-separated string" });
    }

    try {
        if (selectedPlatforms.length === 0) {
            return res.status(400).json({ message: "Platforms parameter is required as a non-empty array" });
        }

        // Find leads that contain the specified platforms
        const leads = await LeadData.find({ platforms: { $in: selectedPlatforms } });

        if (leads.length === 0) {
            return res.status(404).json({ message: "No leads found for the specified platform(s)" });
        }

        res.status(200).json({ leads });
    } catch (err) {
        console.error("Error retrieving leads by platform:", err);
        res.status(500).json({ message: "An error occurred while retrieving leads" });
    }
};



//Fetch leads by Platforms and Tags

exports.getLeadsByPlatformAndTag = async (req, res) => {
    let selectedPlatforms = [];
    let selectedTags = [];

    // Parse platforms from the request
    if (req.body.platforms) {
        selectedPlatforms = typeof req.body.platforms === 'string' ? 
                            req.body.platforms.split(',').map(platform => platform.trim()) : 
                            req.body.platforms;
    }

    // Parse tags from the request
    if (req.body.tags) {
        selectedTags = typeof req.body.tags === 'string' ? 
                       req.body.tags.split(',').map(tag => tag.trim()) : 
                       req.body.tags;
    }

    // Check if at least one of the filters is provided
    if (selectedPlatforms.length === 0 && selectedTags.length === 0) {
        return res.status(400).json({ message: "At least one of the platforms or tags parameters is required." });
    }

    try {
        // Construct a query object based on provided filters
        let query = {};
        if (selectedPlatforms.length > 0) {
            // Using case-insensitive search for platforms
            query.platforms = { $in: selectedPlatforms.map(platform => new RegExp(platform, 'i')) };
        }
        if (selectedTags.length > 0) {
            // Using case-insensitive search for tags, removing word boundaries for broader matching
            const regexPattern = selectedTags.map(tag => `${tag}`).join('|');
            query.tags = { $regex: new RegExp(regexPattern, 'i') };
        }

        // Find leads based on the constructed query
        const leads = await LeadData.find(query);

        if (leads.length === 0) {
            return res.status(404).json({ message: "No leads found matching the criteria." });
        }

        res.status(200).json(leads);
    } catch (err) {
        console.error("Error fetching leads by platform and tag:", err);
        res.status(500).json({ message: "An error occurred while fetching leads" });
    }
};



// search reference in only tags 

exports.getSearchByTag = async (req, res) => {
    let selectedtags;
    // Check if tags are provided in the request body
    if (req.body.tags && typeof req.body.tags === 'string') {
        // Split the string by comma and trim extra whitespace
        selectedtags = req.body.tags.split(',').map(tag => tag.trim());
    } else if (Array.isArray(req.body.tags)) {
        selectedtags = req.body.tags;
    } else {
        return res.status(400).json({ message: "Tags parameter is required as a non-empty array or comma-separated string" });
    }

    try {
        if (selectedtags.length === 0) {
            return res.status(400).json({ message: "Tags parameter is required as a non-empty array" });
        }

        // Construct a regex pattern to match any part of the tag names
        const regexPattern = selectedtags.map(tag => `${tag}`).join('|');
        const regex = new RegExp(regexPattern, 'i');

        // Find leads that contain any tag matching the regex pattern
        const leads = await LeadData.find({ tags: { $regex: regex } });
        console.log(leads)
        if (leads.length === 0) {
            return res.status(404).json({ message: `No leads found for the provided tag(s)` });
        }

        // // Extract unique tags from the found leads
        // const tagsInLeads = leads.reduce((acc, lead) => {
        //     if (Array.isArray(lead.tags)) {
        //         lead.tags.forEach(tag => {
        //             if (!acc.includes(tag)) {
        //                 acc.push(tag);
        //             }
        //         });
        //     }
        //     return acc;
        // }, );
        const tagsArray =  leads.map(lead => lead.tags)
        const tagsSplit = tagsArray.map(tags => tags.split('\n'));

        console.log(tagsSplit);
        res.status(200).json({ tags:tagsSplit  });

    } catch (err) {
        console.error("Error fetching tags by query:", err);
        res.status(500).json({ message: "An error occurred while fetching tags" });
    }
};



// Technology

// exports.getTechnology = async (req, res) => {
//     try {
//         // Get the technology from the query parameter
//         const technology = req.body.Technology;

//         if (!technology) {
//             return res.status(400).json({ message: "Technology parameter is required" });
//         }

//         // Define an array of valid technologies
//         const validTechnologies = ["Blockchain", "Web", "App"];

//         // Check if the provided technology is valid
//         if (!validTechnologies.includes(technology)) {
//             return res.status(400).json({ message: "Invalid technology provided" });
//         }

//         // Find leads matching any of the specified technologies
//         const leads = await LeadData.find({ Technology: technology });

//         if (leads.length === 0) {
//             return res.status(404).json({ message: `No leads found for the provided technology` });
//         }

//         res.status(200).json(leads);
//     } catch (err) {
//         console.error("Error fetching leads by technology:", err);
//         res.status(500).json({ message: "An error occurred while fetching leads" });
//     }
// };


exports.getTechnology = async (req, res) => {
    try {
        // Get the technology from the query parameter or the request body and convert to lowercase
        const technology = (req.query.Technology || req.body.Technology || '').toLowerCase();

        if (!technology) {
            return res.status(400).json({ message: "Technology parameter is required" });
        }

        // Define an array of valid technologies
        const validTechnologies = ["blockchain", "web", "app"];

        // Check if the provided technology is valid (case-insensitive)
        if (!validTechnologies.includes(technology)) {
            return res.status(400).json({ message: "Invalid technology provided" });
        }

        // Find leads matching any of the specified technologies (case-insensitive)
        const leads = await LeadData.find({ Technology: new RegExp(technology, 'i') });

        if (leads.length === 0) {
            return res.status(404).json({ message: `No leads found for the provided technology` });
        }

        res.status(200).json(leads);
    } catch (err) {
        console.error("Error fetching leads by technology:", err);
        res.status(500).json({ message: "An error occurred while fetching leads" });
    }
};




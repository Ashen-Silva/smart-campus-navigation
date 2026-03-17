const mongoose = require('mongoose');
require('dotenv').config();
const MapGraph = require('./models/Map'); 
const AcademicStaff = require('./models/Staff'); 
const User = require('./models/user');

await MapGraph.deleteMany({});
await AcademicStaff.deleteMany({});
await User.deleteMany({}); // <--- Clear old users to avoid "unique" errors
console.log("Database cleared.");

// 3. Create a test user
const testUser = new User({
    username: "dinol", // Use this to log in
    password: "password123" // In production, we would hash this!
});

await testUser.save();
console.log("👤 Test user 'dinol' created.");

const seedData = async () => {
    try {
        // 1. Connect to Atlas
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to Atlas for seeding the UOM Map...");

        // 2. Clear existing database to prevent duplicates
        await MapGraph.deleteMany({});
        await AcademicStaff.deleteMany({});

        // 3. Define the Nodes (Added CSE and Electrical)
        const campusNodes = [
            "University Grounds", "Steel Building", "Department of Material Science", 
            "Department of Mechanical Engineering", "James George Lecture Hall", 
            "Registrar Office", "Library", "Goda Uda Canteen", "Goda Yata Canteen", 
            "Sumanadasa Building", "Department of Computer Science and Engineering", "Electrical Department",
            "Sentra Court", "ENTC", "Faculty of Information Technology", 
            "Faculty of Medicine", "Kaju Kale", "Boat Yard", "Department of Civil Engineering", 
            "Department of Textile and Clothing", "Lagaan", "Gym", "Main Canteen"
        ];

        // 4. Define the Edges
        const campusEdges = [
            // Internal Sumanadasa Connections (Short distance representing stairs/hallways)
            { fromNode: "Sumanadasa Building", toNode: "Department of Computer Science and Engineering", distance: 10, isAccessible: true },
            { fromNode: "Sumanadasa Building", toNode: "Electrical Department", distance: 10, isAccessible: true },

            // Central Hub Connections
            { fromNode: "Library", toNode: "Sentra Court", distance: 110, isAccessible: true },
            { fromNode: "Library", toNode: "Registrar Office", distance: 80, isAccessible: true },
            { fromNode: "Sentra Court", toNode: "Sumanadasa Building", distance: 60, isAccessible: true },
            { fromNode: "Sentra Court", toNode: "ENTC", distance: 70, isAccessible: true },

            // Engineering Blocks (Left Side)
            { fromNode: "Sumanadasa Building", toNode: "Department of Material Science", distance: 90, isAccessible: true },
            { fromNode: "Department of Material Science", toNode: "Department of Mechanical Engineering", distance: 75, isAccessible: true },
            { fromNode: "Department of Mechanical Engineering", toNode: "James George Lecture Hall", distance: 60, isAccessible: true },
            { fromNode: "James George Lecture Hall", toNode: "Registrar Office", distance: 70, isAccessible: true },
            { fromNode: "Sumanadasa Building", toNode: "Steel Building", distance: 120, isAccessible: true },

            // The Goda Canteens (Bottom Left)
            { fromNode: "Department of Mechanical Engineering", toNode: "Goda Uda Canteen", distance: 80, isAccessible: true },
            // Important: Stairs between the upper and lower canteen make this inaccessible for wheelchairs
            { fromNode: "Goda Uda Canteen", toNode: "Goda Yata Canteen", distance: 10, isAccessible: false }, 

            // Upper Campus & Recreation (Top Left)
            { fromNode: "Steel Building", toNode: "University Grounds", distance: 130, isAccessible: true },
            { fromNode: "University Grounds", toNode: "Lagaan", distance: 110, isAccessible: true },
            { fromNode: "Lagaan", toNode: "Gym", distance: 50, isAccessible: true },
            { fromNode: "Gym", toNode: "Sumanadasa Building", distance: 85, isAccessible: true },
            { fromNode: "Gym", toNode: "Department of Textile and Clothing", distance: 80, isAccessible: true },

            // Right Campus & Allied Faculties (Top Right to Bottom Right)
            { fromNode: "Department of Textile and Clothing", toNode: "Department of Civil Engineering", distance: 100, isAccessible: true },
            { fromNode: "Department of Civil Engineering", toNode: "Boat Yard", distance: 90, isAccessible: true },
            { fromNode: "Department of Civil Engineering", toNode: "Faculty of Information Technology", distance: 140, isAccessible: true },
            { fromNode: "Faculty of Information Technology", toNode: "Main Canteen", distance: 70, isAccessible: true },
            { fromNode: "Main Canteen", toNode: "Sumanadasa Building", distance: 100, isAccessible: true },
            { fromNode: "Faculty of Information Technology", toNode: "ENTC", distance: 65, isAccessible: true },
            { fromNode: "Faculty of Information Technology", toNode: "Faculty of Medicine", distance: 120, isAccessible: true },
            { fromNode: "Faculty of Medicine", toNode: "Kaju Kale", distance: 160, isAccessible: true },
            
            // Connecting the right perimeter back to the entrance
            { fromNode: "Kaju Kale", toNode: "Library", distance: 250, isAccessible: true }
        ];

        // 5. Create the Map Document
        const uomMap = new MapGraph({
            nodes: campusNodes,
            edges: campusEdges
        });

        // 6. Create Initial Staff Data for the Sumanadasa Building
        const initialStaff = [
            { name: "Dr. Sandamal", department: "CSE", currentStatus: "InOffice", location: "Department of Computer Science and Engineering - Room 201" },
            { name: "Dr. Ranmali", department: "Electrical", currentStatus: "InLecture", location: "Electrical Department - Lecture Hall 1" }
        ];

        // 7. Save to Atlas
        await uomMap.save();
        await AcademicStaff.insertMany(initialStaff);

        console.log("🌱 Success: The UOM Map Graph and initial staff have been pushed to Atlas!");
        console.log(`Uploaded ${campusNodes.length} nodes and ${campusEdges.length} edges.`);
        process.exit();

    } catch (err) {
        console.error("❌ Error seeding database:", err);
        process.exit(1);
    }
};

seedData();


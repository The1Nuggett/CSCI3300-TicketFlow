class Ticket {

    constructor(id, requesterName, requesterEmail, title, description, category, department, priority, expectedDate) {
        this.id = id;
        this.requesterName = requesterName;
        this.requesterEmail = requesterEmail;
        this.title = title;
        this.description = description;
        this.category = category;
        this.department = department;
        this.priority = priority;
        this.expectedDate = expectedDate;

        this.status = "Open";

        this.createdDate = new Date();
        this.closedDate = null;
        this.assignedTechnician = null;
        this.assignedTechnicianName = null;
        // Technician level auto assign logic.
        //I was losing my mind trying to figure this out
        this.requiredLevel = this.calculateRequiredLevel();
        this.priorityScore = this.calculatePriorityScore();
        this.autoAssignTechnician();

        this.technicianNotes = "";
        this.notes = [];

        this.activityLog = [];

        this.addActivity("Ticket created.");
    }

    addActivity(message) {
        this.activityLog.push({
            date: new Date(),
            message: message
        });
    }

    calculatePriorityScore() {
        // Ticket heirarchy, lower score means higher priority
        const priorityScores = {
            Critical: 1,
            High: 2,
            Medium: 3,
            Low: 4
        };

        let score = priorityScores[this.priority] || 3;
        const department = String(this.department || "").toLowerCase();
        const description = String(this.description || "").toLowerCase();
        const isFloorOperations = department.includes("floor")
            || description.includes("floor operation");

        // Our logic that if a ticket involes floor operations, it needs to get a bump down of .5, make its higher priority.
        //goal is to replicate real world escalation
        if (isFloorOperations) score -= 0.5;
        return Math.max(1, score);
    }

    calculateRequiredLevel() {
        // Priority cut off values, if value is 1-1.5, level 3, if value 2-2.5, level 2, etc
        //Maybe i should change it but it works, first rule of tech, if it works dont touch
        const score = this.calculatePriorityScore();
        if (score <= 1.5) return 3;
        if (score <= 2.5) return 2;
        return 1;
    }

    autoAssignTechnician() {
        // Our auto assigning feature, based off of calculated values it assigns to a different level of technician, this is a simple example, in real world it would be more complex, I would hope.....
        const routing = {
            1: { id: "technician1@company.com", name: "Level 1 Technician" },
            2: { id: "technician2@company.com", name: "Level 2 Technician" },
            3: { id: "technician3@company.com", name: "Level 3 Technician" }
        };
        const technician = routing[this.requiredLevel] || routing[1];
        this.assignedTechnician = technician.id;
        this.assignedTechnicianName = technician.name;
    }

    updateStatus(status) {
        this.status = status;

        this.addActivity(`Status changed to ${status}`);

        if (status === "Closed") {
            this.closedDate = new Date();
        }
    }

    addTechnicianNote(note) {
        this.technicianNotes += note + "\n";
        this.addActivity("Technician note added.");
    }

}
//End goal is to get it as close to real world as possible, similar to Track IT or Service now
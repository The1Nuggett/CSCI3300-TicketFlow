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

        if (isFloorOperations) score -= 0.5;
        return Math.max(1, score);
    }

    calculateRequiredLevel() {
        const score = this.calculatePriorityScore();
        if (score <= 1.5) return 3;
        if (score <= 2.5) return 2;
        return 1;
    }

    autoAssignTechnician() {
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

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

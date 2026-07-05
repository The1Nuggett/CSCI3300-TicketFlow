package com.ticketflow.demo;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "tickets") //Automatically creates a "tickets" table in H2)
public class Ticket {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY) //Increments ticket IDs automatically
	private Long id;
	
	private String title;
	private String priority;
	private String status;
	private String assignedTo;
	
	//Default constructor for jakarta persistence
	public Ticket() {}
	
	// Constructor for creating new tickets
	public Ticket(String title, String priority, String status, String assignedTo) {
		this.title = title;
		this.priority = priority;
		this.status = status;
		this.assignedTo = assignedTo;
	}
	// Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getAssignedTo() { return assignedTo; }
    public void setAssignedTo(String assignedTo) { this.assignedTo = assignedTo; }
}

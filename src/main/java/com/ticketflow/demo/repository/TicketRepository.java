package com.ticketflow.demo.repository;

import com.ticketflow.demo.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository; // <-- Add this import
import java.util.List;

@Repository 
public interface TicketRepository extends JpaRepository<Ticket, Long> {
    
    // Spring generates this SQL query automatically based on the method name!
    List<Ticket> findByStatus(String status);
    
    // Counts tickets by status to feed your dashboard KPI cards
    long countByStatus(String status);
}

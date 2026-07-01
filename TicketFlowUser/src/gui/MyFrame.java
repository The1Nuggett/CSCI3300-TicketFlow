package gui;

import javax.swing.JFrame;
import javax.swing.JLabel;
import javax.swing.JPanel;
import javax.swing.BorderFactory;
import javax.swing.ImageIcon;

import java.awt.BorderLayout;
import java.awt.Color;
import java.awt.event.ActionListener;
import javax.swing.JButton;


public class MyFrame extends JFrame implements ActionListener {
	
	MyFrame(){
		
		ImageIcon icon = new ImageIcon("testBee.jpg");
		
		JLabel redLabel = new JLabel("Submit a ticket");
		redLabel.setIcon(icon);
		redLabel.setVerticalAlignment(JLabel.CENTER);
		redLabel.setHorizontalAlignment(JLabel.CENTER);
		
		JLabel blueLabel = new JLabel("View tickets");
		blueLabel.setIcon(icon);
		blueLabel.setVerticalAlignment(JLabel.CENTER);
		blueLabel.setHorizontalAlignment(JLabel.CENTER);
		
		JLabel greenLabel = new JLabel("Other");
		greenLabel.setIcon(icon);
		greenLabel.setVerticalAlignment(JLabel.CENTER);
		greenLabel.setHorizontalAlignment(JLabel.CENTER);
		
		JPanel redPanel = new JPanel();
		redPanel.setBackground(Color.red);
		redPanel.setBounds(0,0,250,250);
		redPanel.setLayout(new BorderLayout());
		
		JPanel bluePanel = new JPanel();
		bluePanel.setBackground(Color.blue);
		bluePanel.setBounds(250,0,250,250);
		bluePanel.setLayout(new BorderLayout());
		
		JPanel greenPanel = new JPanel();
		greenPanel.setBackground(Color.green);
		greenPanel.setBounds(0,250,500,250);
		greenPanel.setLayout(new BorderLayout());
		
		this.setTitle("TicketFlow - User Dashboard");
		this.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE); // exit on close instead of hide on close
		//this.setResizable(false);
		this.setSize(500,500);
		ImageIcon image = new ImageIcon("ticketflow.jpg");
		this.setIconImage(image.getImage()); // change icon of this
		this.getContentPane().setBackground(Color.gray); // change color of background
		
		this.setLayout(null);
		
		redPanel.add(redLabel);
		bluePanel.add(blueLabel);
		greenPanel.add(greenLabel);
		
		this.add(redPanel);
		this.add(bluePanel);
		this.add(greenPanel);
		
		this.setVisible(true);
	}
}

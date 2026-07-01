package gui;

import javax.swing.JOptionPane;

public class login {

	public static void main(String[] args) {
		
		String username;
		String password = null;
		boolean userLogin = false;
		boolean adminLogin = false;
		
		username = JOptionPane.showInputDialog("Username: ");
		
		if (username.equals("user")) {
			password = JOptionPane.showInputDialog("Password: ");
			if (password.equals("pass")) {
				JOptionPane.showMessageDialog(null, "Welcome " + username);
				userLogin = true;
			}
			else {
				JOptionPane.showMessageDialog(null, "Invalid Credentials.");
			}
		}
		else if (username.equals("admin")) {
			password = JOptionPane.showInputDialog("Password: ");
			if (password.equals("pass")) {
				JOptionPane.showMessageDialog(null, "Welcome " + username);
				adminLogin = true;
			}		
		}
		else {
			JOptionPane.showMessageDialog(null, "Invalid Credentials.");
		}
		
		if (userLogin) {
			MyFrame UserDashboard = new MyFrame();
		}
		if (adminLogin) {
			MyFrameAdmin AdminDashboard = new MyFrameAdmin();
		}
	}

}

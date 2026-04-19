CREATE DATABASE issuexpert;
USE issuexpert;

-- Tables --

CREATE TABLE Roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL
);
CREATE TABLE Users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    password VARCHAR(255) NOT NULL,
    role_id INT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    active BOOLEAN NOT NULL DEFAULT 1,
    FOREIGN KEY (role_id) REFERENCES Roles(id) ON DELETE RESTRICT
);
CREATE TABLE TicketStatus (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL
);
CREATE TABLE Category (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL
);
CREATE TABLE Tickets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NULL,
    priority INT NOT NULL DEFAULT 1,
	status_id INT NOT NULL,
    created_by INT NULL,
    assigned_to INT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (status_id) REFERENCES TicketStatus(id) ON DELETE RESTRICT,
    FOREIGN KEY (created_by) REFERENCES Users(id) ON DELETE SET NULL,
    FOREIGN KEY (assigned_to) REFERENCES Users(id) ON DELETE SET NULL
);
CREATE TABLE TicketCategories (
	ticket_id INT NOT NULL,
	category_id INT NOT NULL,
	PRIMARY KEY (ticket_id, category_id),
	FOREIGN KEY (ticket_id) REFERENCES Tickets(id) ON DELETE CASCADE,
	FOREIGN KEY (category_id) REFERENCES Category(id) ON DELETE CASCADE
);
CREATE TABLE Messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ticket_id INT NOT NULL,
    sender_id INT NULL,
    message TEXT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ticket_id) REFERENCES Tickets(id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES Users(id) ON DELETE SET NULL
);
CREATE TABLE FileAttachment (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ticket_id INT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    uploaded_by INT NULL,
    uploaded_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ticket_id) REFERENCES Tickets(id) ON DELETE CASCADE,
    FOREIGN KEY (uploaded_by) REFERENCES Users(id) ON DELETE SET NULL
);

-- Test data --
INSERT INTO Roles (name) VALUES
	('admin'),
	('technician'),
	('user');
INSERT INTO Users (username, email, password, role_id) VALUES
	('admin', 'admin@test.com', 'pass123', 1),
	('agent1', 'agent1@test.com', 'pass123', 2),
	('agent2', 'agent2@test.com', 'pass123', 2),
	('user1', 'user1@test.com', 'pass123', 3),
	('user2', 'user2@test.com', 'pass123', 3);
INSERT INTO TicketStatus (name) VALUES
	('Open'),
	('In Progress'),
	('Resolved'),
	('Closed');
INSERT INTO Category (name) VALUES
	('Software'),
	('Hardware'),
	('Network'),
	('Account');
INSERT INTO Tickets (title, description, priority, status_id, created_by, assigned_to) VALUES
	('Cannot login', 'User cannot login to system', 3, 1, 4, 2),
	('Computer not starting', 'PC fails to boot', 5, 1, 5, 3),
	('VPN not working', 'VPN connection fails', 4, 2, 4, 2);
INSERT INTO TicketCategories (ticket_id, category_id) VALUES
	(1, 1),
	(1, 4),
	(2, 2),
	(3, 3);
INSERT INTO Messages (ticket_id, sender_id, message) VALUES
	(1, 4, 'I cannot access my account'),
	(1, 2, 'We are investigating the issue'),
	(2, 5, 'My computer does not start'),
	(2, 3, 'Please check the power cable'),
	(3, 4, 'VPN disconnects frequently');
INSERT INTO FileAttachment (ticket_id, file_name, file_path, uploaded_by) VALUES
	(1, 'error_screenshot.png', '/uploads/error_screenshot.png', 4),
	(2, 'pc_photo.jpg', '/uploads/pc_photo.jpg', 5),
	(3, 'vpn_log.txt', '/uploads/vpn_log.txt', 4);

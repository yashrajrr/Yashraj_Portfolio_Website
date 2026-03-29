from http.server import BaseHTTPRequestHandler
import json
import smtplib
from email.message import EmailMessage
import os

class handler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        # Handle CORS preflight requests
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Accept')
        self.end_headers()

    def do_POST(self):
        # Get JSON payload from the request
        content_length = int(self.headers.get('Content-Length', 0))
        post_data = self.rfile.read(content_length)
        
        try:
            data = json.loads(post_data.decode('utf-8'))
        except json.JSONDecodeError:
            self.send_response(400)
            self.end_headers()
            self.wfile.write(b"Invalid JSON data")
            return
            
        name = data.get('name', 'Unknown Identifier')
        email = data.get('email', 'No Endpoint Provided')
        message = data.get('message', 'No Payload')

        # Environment variables securely configured on Vercel
        sender_email = os.environ.get('SMTP_EMAIL')
        sender_password = os.environ.get('SMTP_PASSWORD')
        recipient_email = 'yashrajrathor2005@gmail.com'

        if not sender_email or not sender_password:
            self.send_response(500)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            debug_info = f"SMTP_EMAIL is '{sender_email}'. SMTP_PASSWORD is {'SET' if sender_password else 'MISSING'}."
            self.wfile.write(json.dumps({
                "success": False, 
                "error": f"Server SMTP variables missing. {debug_info} Please check Vercel Environment Variables exactly."
            }).encode('utf-8'))
            return

        # Construction of the standard Email Message
        msg = EmailMessage()
        msg.set_content(f"Portfolio Communication Received:\n\nSender: {name}\nReturn Endpoint: {email}\n\nPayload:\n{message}")
        msg['Subject'] = f"PORTFOLIO CONTACT: Message from {name}"
        msg['From'] = sender_email
        msg['To'] = recipient_email

        # Execution of SMTP transmission via standard library
        try:
            with smtplib.SMTP_SSL('smtp.gmail.com', 465) as smtp:
                smtp.login(sender_email, sender_password)
                smtp.send_message(msg)
            
            # Send Success Response
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps({"success": True}).encode('utf-8'))
            
        except Exception as e:
            # Send Error Response
            self.send_response(500)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps({
                "success": False, 
                "error": f"SMTP Transmission Failure: {str(e)}"
            }).encode('utf-8'))

import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, email, institution, role, lms, interest, message } = req.body;

    // Validate required fields
    if (!name || !email || !institution) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Format interest array
    const interestLabels = {
      'demo': 'Book a demo',
      'bett': 'Meeting at Bett London (Jan 21-23)',
      'pricing': 'Pricing information',
      'info': 'General information'
    };

    const interests = Array.isArray(interest)
      ? interest.map(i => interestLabels[i] || i).join(', ')
      : interest || 'Not specified';

    // Role labels
    const roleLabels = {
      'teacher': 'Teacher / Lecturer',
      'head': 'Head of Department',
      'it': 'IT / Technology Lead',
      'admin': 'Administrator / Leadership',
      'procurement': 'Procurement',
      'other': 'Other'
    };

    // LMS labels
    const lmsLabels = {
      'canvas': 'Canvas',
      'moodle': 'Moodle',
      'blackboard': 'Blackboard',
      'schoology': 'Schoology',
      'google': 'Google Classroom',
      'other': 'Other',
      'none': 'None / Not sure'
    };

    // Send email via Resend
    const { data, error } = await resend.emails.send({
      from: 'NovaLearn <contact@novalearn.co.uk>',
      to: ['lars@novalearn.co.uk'],
      replyTo: email,
      subject: `New NovaLearn Inquiry from ${name} - ${institution}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #9b3d2b 0%, #7a3022 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
            .content { background: #f9f9f9; padding: 20px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 8px 8px; }
            .field { margin-bottom: 16px; }
            .label { font-weight: 600; color: #666; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
            .value { margin-top: 4px; font-size: 16px; }
            .message-box { background: white; padding: 16px; border-radius: 8px; border: 1px solid #e0e0e0; margin-top: 8px; }
            .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #e0e0e0; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0; font-size: 24px;">New Contact Form Submission</h1>
              <p style="margin: 8px 0 0 0; opacity: 0.9;">From novalearn.co.uk</p>
            </div>
            <div class="content">
              <div class="field">
                <div class="label">Name</div>
                <div class="value">${name}</div>
              </div>
              <div class="field">
                <div class="label">Email</div>
                <div class="value"><a href="mailto:${email}">${email}</a></div>
              </div>
              <div class="field">
                <div class="label">Institution</div>
                <div class="value">${institution}</div>
              </div>
              <div class="field">
                <div class="label">Role</div>
                <div class="value">${roleLabels[role] || role || 'Not specified'}</div>
              </div>
              <div class="field">
                <div class="label">LMS</div>
                <div class="value">${lmsLabels[lms] || lms || 'Not specified'}</div>
              </div>
              <div class="field">
                <div class="label">Interested In</div>
                <div class="value">${interests}</div>
              </div>
              ${message ? `
              <div class="field">
                <div class="label">Additional Message</div>
                <div class="message-box">${message.replace(/\n/g, '<br>')}</div>
              </div>
              ` : ''}
              <div class="footer">
                <p><strong>Quick Actions:</strong></p>
                <p>
                  <a href="mailto:${email}?subject=Re: Your NovaLearn Inquiry">Reply to ${name}</a>
                </p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    if (error) {
      console.error('Resend error:', error);
      return res.status(500).json({ error: 'Failed to send email' });
    }

    return res.status(200).json({ success: true, id: data.id });
  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
}

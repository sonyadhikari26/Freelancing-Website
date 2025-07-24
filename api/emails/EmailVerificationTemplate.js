const React = require('react');
const {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Link,
  Button,
  Hr,
  Img
} = require('@react-email/components');

const EmailVerificationTemplate = ({ 
  username, 
  verificationUrl, 
  expiryTime 
}) => {
  return React.createElement(Html, null,
    React.createElement(Head, null),
    React.createElement(Body, { 
      style: { 
        backgroundColor: '#f6f9fc',
        fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif'
      }
    },
      React.createElement(Container, {
        style: {
          margin: '0 auto',
          padding: '20px 0 48px',
          maxWidth: '560px'
        }
      },
        React.createElement(Section, {
          style: {
            backgroundColor: '#ffffff',
            border: '1px solid #f0f0f0',
            borderRadius: '5px',
            boxShadow: '0 5px 10px rgba(20, 50, 70, 0.2)',
            marginTop: '8px',
            padding: '35px'
          }
        },
          React.createElement('div', {
            style: {
              textAlign: 'center',
              marginBottom: '32px'
            }
          },
            React.createElement('h1', {
              style: {
                color: '#1f2937',
                fontSize: '24px',
                fontWeight: 'bold',
                margin: '0 0 16px',
                padding: '0'
              }
            }, 'Welcome to TalentLink!')
          ),
          
          React.createElement(Text, {
            style: {
              color: '#374151',
              fontSize: '16px',
              lineHeight: '24px',
              margin: '16px 0'
            }
          }, `Hi ${username},`),
          
          React.createElement(Text, {
            style: {
              color: '#374151',
              fontSize: '16px',
              lineHeight: '24px',
              margin: '16px 0'
            }
          }, 'Thank you for signing up for TalentLink! To complete your registration and start exploring amazing freelance opportunities, please verify your email address by clicking the button below:'),
          
          React.createElement('div', {
            style: {
              textAlign: 'center',
              margin: '32px 0'
            }
          },
            React.createElement(Button, {
              href: verificationUrl,
              style: {
                backgroundColor: '#3b82f6',
                borderRadius: '5px',
                color: '#ffffff',
                fontSize: '16px',
                fontWeight: 'bold',
                textDecoration: 'none',
                textAlign: 'center',
                display: 'inline-block',
                padding: '12px 24px'
              }
            }, 'Verify Email Address')
          ),
          
          React.createElement(Text, {
            style: {
              color: '#6b7280',
              fontSize: '14px',
              lineHeight: '20px',
              margin: '16px 0'
            }
          }, 'If the button above doesn\'t work, you can also copy and paste the following link into your browser:'),
          
          React.createElement(Link, {
            href: verificationUrl,
            style: {
              color: '#3b82f6',
              fontSize: '14px',
              textDecoration: 'underline',
              wordBreak: 'break-all'
            }
          }, verificationUrl),
          
          React.createElement(Hr, {
            style: {
              borderColor: '#e5e7eb',
              margin: '20px 0'
            }
          }),
          
          React.createElement(Text, {
            style: {
              color: '#6b7280',
              fontSize: '12px',
              lineHeight: '16px'
            }
          }, `This verification link will expire in ${expiryTime}. If you didn't create an account with TalentLink, you can safely ignore this email.`),
          
          React.createElement(Text, {
            style: {
              color: '#6b7280',
              fontSize: '12px',
              lineHeight: '16px',
              marginTop: '16px'
            }
          }, 'Best regards,'),
          React.createElement(Text, {
            style: {
              color: '#6b7280',
              fontSize: '12px',
              lineHeight: '16px',
              fontWeight: 'bold'
            }
          }, 'The TalentLink Team')
        )
      )
    )
  );
};

module.exports = EmailVerificationTemplate;

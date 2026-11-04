-- Migration: V1_15__add_bug_resolved_mail_template.sql

INSERT INTO `templates` (
    `createdAt`,
    `updatedAt`,
    `deletedAt`,
    `isDeletionRestricted`,
    `id`,
    `name`,
    `content`,
    `size`
) VALUES (
    NOW(6),
    NOW(6),
    NULL,
    0,
    '49d3344f-ab74-4ef5-b87a-15ede6359eed',
    'bug-resolved',
    '<!DOCTYPE html>\n<html>\n\n<head>\n  <meta charset=\"UTF-8\" />\n  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\" />\n  <title>Bug Report Resolved</title>\n  <link href=\"https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css\" rel=\"stylesheet\" />\n</head>\n\n<body style=\"\n      font-family: sans-serif;\n      color: #343a40;\n      max-width: 600px;\n      margin: auto;\n      padding: 20px;\n    \">\n  <div class=\"text-center mb-4\">\n    <% if (typeof logo !== ''undefined'' && logo) { %>\n      <img src=\"<%= logo %>\" alt=\"<%= typeof name !== ''undefined'' ? name : '''' %>\" style=\"max-height: 64px; margin-bottom: 20px\" />\n    <% } %>\n    <h1 class=\"text-primary fs-4 fw-bold\">\n      <%= typeof name !== ''undefined'' && name ? name : ''Bug Report Resolved'' %>\n    </h1>\n  </div>\n\n  <div class=\"bg-light p-4 rounded mb-4 shadow-sm\">\n    <h2 class=\"fs-5 fw-semibold mb-3\">Hello <%= typeof client !== ''undefined'' ? client : ''Valued User'' %>,</h2>\n\n    <p class=\"mb-3\">\n      A bug report you expressed interest in has just been marked as <strong>Resolved</strong>.\n    </p>\n\n    <div class=\"bg-white p-3 rounded border mb-3\">\n      <div class=\"text-muted small text-uppercase fw-semibold mb-1\">\n        Bug #<%= typeof bugId !== ''undefined'' ? bugId : '''' %> &bull; <%= typeof variant !== ''undefined'' ? variant : '''' %>\n      </div>\n      <h3 class=\"fs-6 fw-bold mb-2 text-dark\"><%= typeof title !== ''undefined'' ? title : '''' %></h3>\n      <p class=\"mb-0 text-secondary\" style=\"white-space: pre-wrap;\"><%= typeof description !== ''undefined'' ? description : '''' %></p>\n    </div>\n\n    <p class=\"mb-0 text-secondary\">\n      Thank you for your valuable interest and patience while we worked on resolving this issue.\n    </p>\n  </div>\n\n  <div class=\"border-top pt-4 text-muted small\">\n    <% if (typeof support !== ''undefined'' && support) { %>\n      <p class=\"fw-semibold mb-2\">Need Help?</p>\n      <p class=\"mb-4\">\n        If you have any questions or need assistance, please don''t hesitate to contact our support team at\n        <a href=\"mailto:<%= support %>\" class=\"text-primary text-decoration-none\">\n          <%= support %>\n        </a>\n      </p>\n    <% } %>\n\n    <p class=\"mb-4\">\n      Best regards,<br />\n      The <%= typeof name !== ''undefined'' && name ? name : ''Support'' %> Team\n    </p>\n\n    <div class=\"pt-3 border-top text-secondary small\">\n      <% if (typeof address !== ''undefined'' && address) { %>\n        <p>\n          <%= typeof name !== ''undefined'' && name ? name : '''' %><br />\n          <%= address %>\n        </p>\n      <% } %>\n      <p class=\"mt-3\">\n        This email was sent automatically because you were added to the interested users list for this bug report.\n      </p>\n    </div>\n  </div>\n</body>\n\n</html>\n',
    2155
)
ON DUPLICATE KEY UPDATE
    `content` = VALUES(`content`),
    `size` = VALUES(`size`),
    `updatedAt` = NOW(6);

INSERT IGNORE INTO `template_template_styles` (`templateId`, `styleId`)
SELECT '49d3344f-ab74-4ef5-b87a-15ede6359eed', `id`
FROM `template-styles`
WHERE `name` = 'bootstrap'
LIMIT 1;

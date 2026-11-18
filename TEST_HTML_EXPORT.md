# Testing HTML Export - Mock Data Demo

Since your network has Zscaler blocking external sites, here's how to test the HTML export fix with mock data:

## Quick Test Script

Save this as `test-html-export.js` in the project root:

```javascript
// Test HTML Export with Mock Data
const mockCapture = {
  title: "Test Page",
  url: "https://test.example.com",
  capturedAt: new Date().toISOString(),
  html: `
    <div class="container">
      <header class="header">
        <h1 class="title">Welcome to Test Page</h1>
        <p class="subtitle">This is a demonstration</p>
      </header>
      <main class="content">
        <section class="card">
          <h2>Feature 1</h2>
          <p>Description of feature one</p>
        </section>
        <section class="card">
          <h2>Feature 2</h2>
          <p>Description of feature two</p>
        </section>
      </main>
    </div>
  `,
  rootStyles: {
    fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
    fontSize: '16px',
    lineHeight: '1.5',
    color: 'rgb(33, 37, 41)',
    backgroundColor: 'rgb(248, 249, 250)'
  },
  elements: [
    {
      tag: 'div',
      selector: '.container',
      styles: {
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '20px'
      }
    },
    {
      tag: 'header',
      selector: '.header',
      styles: {
        backgroundColor: 'rgb(13, 110, 253)',
        color: 'white',
        padding: '40px',
        borderRadius: '8px',
        marginBottom: '30px'
      }
    },
    {
      tag: 'h1',
      selector: '.title',
      styles: {
        fontSize: '48px',
        fontWeight: '700',
        margin: '0 0 10px 0'
      }
    },
    {
      tag: 'p',
      selector: '.subtitle',
      styles: {
        fontSize: '20px',
        margin: '0',
        opacity: '0.9'
      }
    },
    {
      tag: 'section',
      selector: '.card',
      styles: {
        backgroundColor: 'white',
        padding: '30px',
        marginBottom: '20px',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        border: '1px solid rgb(222, 226, 230)'
      }
    }
  ]
};

// Test the export
fetch('http://localhost:8787/api/export/html', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ capture: mockCapture })
})
  .then(res => res.blob())
  .then(blob => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'test-export.zip';
    a.click();
    console.log('✓ Export downloaded as test-export.zip');
  })
  .catch(err => console.error('✗ Export failed:', err));
```

## Or Test with curl:

```bash
# Send mock capture data
curl -X POST http://localhost:8787/api/export/html \
  -H "Content-Type: application/json" \
  -d '{
    "capture": {
      "title": "Test Page",
      "url": "https://test.example.com",
      "html": "<div class=\"test\"><h1 style=\"color: blue;\">Hello World</h1><p>Test paragraph</p></div>",
      "rootStyles": {
        "fontFamily": "Arial, sans-serif",
        "backgroundColor": "rgb(240, 240, 240)",
        "color": "rgb(33, 33, 33)"
      },
      "elements": [
        {
          "tag": "h1",
          "selector": "h1",
          "styles": {
            "fontSize": "32px",
            "color": "rgb(0, 0, 255)",
            "fontWeight": "700",
            "margin": "20px 0"
          }
        }
      ]
    }
  }' \
  -o test-export.zip

# Extract and view
unzip test-export.zip -d test-export
# Now open test-export/index.html in your browser
```

## What You Should See:

After extracting the ZIP, you'll find:

1. **index.html** - With proper `<link rel="stylesheet" href="styles.css">` tag
2. **styles.css** - With extracted styles like:
   ```css
   body {
     background-color: rgb(240, 240, 240);
     color: rgb(33, 33, 33);
     font-family: Arial, sans-serif;
   }
   
   h1 {
     font-size: 32px;
     color: rgb(0, 0, 255);
     font-weight: 700;
     margin: 20px 0;
   }
   ```
3. **design.json** - Full capture data
4. **README.txt** - Instructions

## Testing from the Web UI:

Once you can capture a real site (outside Zscaler), the workflow is:
1. Enter URL → Extract design
2. Click on capture in Capture Library
3. Click "HTML + CSS" in Export Studio
4. Download and extract ZIP
5. Open `index.html` - styles will now work! ✓

---

## Alternative: Test Locally Without Network

You can also test the entire flow by temporarily modifying the API to accept local HTML files, or by using a local test server that doesn't require external network access.

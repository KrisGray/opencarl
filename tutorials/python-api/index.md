---
title: Python API Project Tutorial
description: Test-driven development with pytest, mocks, and external APIs
---

# Python API Project Tutorial

Learn OpenCARL by building a real project: a Python client that fetches gene information from the HGNC and NCBI Gene APIs using test-driven development.

**What you'll build:**
- Python client for HGNC REST API (`rest.genenames.org`)
- NCBI Gene API integration
- Full pytest test suite with mocks
- Test-driven development workflow

**Prerequisites:**
- Python 3.10+
- pytest installed
- Basic understanding of REST APIs

---

## Step 1: Install OpenCARL

```bash
# Create project directory
mkdir gene-api-client
cd gene-api-client

# Initialize Python project
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Install dependencies
pip install pytest pytest-mock requests

# Install OpenCARL
npm install opencarl

# Configure opencode.json
echo '{"plugin": ["opencarl"]}' > opencode.json

# Run OpenCARL setup
npx opencarl --local
```

---

## Step 2: Create the DEVELOPMENT Domain

OpenCARL will automatically inject your development preferences when you mention keywords like "write code", "implement", or "test".

Use the `/opencarl` commands to create and populate the domain:

```
# Create the domain with recall keywords
/opencarl create DEVELOPMENT --recall 'write code, implement, test, fix bug, refactor, function, class'

# Add your development rules
/opencarl add rule DEVELOPMENT 'Always write tests first (TDD)'
/opencarl add rule DEVELOPMENT 'Use pytest with mocks for external APIs'
/opencarl add rule DEVELOPMENT 'Never make real API calls in tests'
/opencarl add rule DEVELOPMENT 'Keep functions small and focused'
/opencarl add rule DEVELOPMENT 'Use type hints for all function signatures'
/opencarl add rule DEVELOPMENT 'Handle errors explicitly with try/except'
```

This creates `.opencarl/development` and configures the manifest automatically.

**What's happening behind the scenes:**

```
# .opencarl/development
DEVELOPMENT_RULE_0=Always write tests first (TDD)
DEVELOPMENT_RULE_1=Use pytest with mocks for external APIs
DEVELOPMENT_RULE_2=Never make real API calls in tests
DEVELOPMENT_RULE_3=Keep functions small and focused
DEVELOPMENT_RULE_4=Use type hints for all function signatures
DEVELOPMENT_RULE_5=Handle errors explicitly with try/except

# .opencarl/manifest (auto-configured)
DEVELOPMENT_STATE=active
DEVELOPMENT_RECALL=write code, implement, test, fix bug, refactor, function, class
DEVELOPMENT_EXCLUDE=
DEVELOPMENT_ALWAYS_ON=false
```

---

## Step 3: Test-Driven Development

Now when you work on this project, just mention relevant keywords and OpenCARL will load your rules:

```
You: help me implement a function to fetch gene data from HGNC API

OpenCARL: [Loads DEVELOPMENT rules]
  - Always write tests first (TDD)
  - Use pytest with mocks for external APIs
  - Never make real API calls in tests
  - ...
```

### Example: Writing the First Test

**You:** "Write a test for fetching HGNC gene data by ID"

OpenCARL will guide you toward TDD with mocks:

```python
# tests/test_hgnc_client.py
import pytest
from unittest.mock import Mock, patch
from hgnc_client import HGNCClient

class TestHGNCClient:
    def test_fetch_gene_by_id_success(self):
        """Test successful gene fetch by HGNC ID."""
        mock_response = {
            "responseHeader": {"status": 0},
            "response": {
                "docs": [{
                    "hgnc_id": "HGNC:5",
                    "symbol": "A1BG",
                    "name": "alpha-1-B glycoprotein",
                    "entrez_id": "1"
                }]
            }
        }
        
        with patch('requests.get') as mock_get:
            mock_get.return_value = Mock(
                status_code=200,
                json=lambda: mock_response
            )
            
            client = HGNCClient()
            result = client.fetch_by_hgnc_id("HGNC:5")
            
            assert result["symbol"] == "A1BG"
            assert result["entrez_id"] == "1"
            mock_get.assert_called_once_with(
                "https://rest.genenames.org/fetch/hgnc_id/HGNC:5",
                headers={"Accept": "application/json"}
            )
```

### Then Implement

**You:** "Now implement the HGNC client to pass this test"

```python
# src/hgnc_client.py
import requests
from typing import Optional, Dict, Any

class HGNCClient:
    BASE_URL = "https://rest.genenames.org"
    
    def __init__(self, timeout: int = 30):
        self.timeout = timeout
        self.headers = {"Accept": "application/json"}
    
    def fetch_by_hgnc_id(self, hgnc_id: str) -> Optional[Dict[str, Any]]:
        """Fetch gene data by HGNC ID.
        
        Args:
            hgnc_id: HGNC identifier (e.g., "HGNC:5")
            
        Returns:
            Gene data dictionary or None if not found
            
        Raises:
            requests.RequestException: On network errors
        """
        url = f"{self.BASE_URL}/fetch/hgnc_id/{hgnc_id}"
        
        try:
            response = requests.get(url, headers=self.headers, timeout=self.timeout)
            response.raise_for_status()
            
            data = response.json()
            docs = data.get("response", {}).get("docs", [])
            
            if docs:
                return docs[0]
            return None
            
        except requests.RequestException as e:
            raise requests.RequestException(f"Failed to fetch {hgnc_id}: {e}")
```

---

## Step 4: NCBI Gene Integration

**You:** "Write a test for fetching NCBI gene data using the entrez_id from HGNC"

```python
# tests/test_ncbi_client.py
import pytest
from unittest.mock import Mock, patch
from ncbi_client import NBIClient

class TestNBIClient:
    def test_fetch_gene_by_entrez_id_success(self):
        """Test successful gene fetch by NCBI Entrez ID."""
        mock_xml_response = """<?xml version="1.0"?>
        <Entrezgene-Set>
            <Entrezgene>
                <Entrezgene_gene-source>
                    <Gene-source>
                        <Gene-source_src-int>1</Gene-source_src-int>
                    </Gene-source>
                </Entrezgene_gene-source>
                <Entrezgene_summary>Alpha-1-B glycoprotein</Entrezgene_summary>
            </Entrezgene>
        </Entrezgene-Set>
        """
        
        with patch('requests.get') as mock_get:
            mock_get.return_value = Mock(
                status_code=200,
                text=mock_xml_response
            )
            
            client = NBIClient()
            result = client.fetch_by_entrez_id("1")
            
            assert result is not None
            mock_get.assert_called_once()
```

---

## Step 5: Integration Test

**You:** "Write an integration test that chains HGNC and NCBI calls (still mocked)"

```python
# tests/test_integration.py
import pytest
from unittest.mock import Mock, patch
from gene_service import GeneService

class TestGeneService:
    @patch('requests.get')
    def test_fetch_complete_gene_report(self, mock_get):
        """Test fetching complete gene report from both APIs."""
        # Mock HGNC response
        hgnc_response = Mock(
            status_code=200,
            json=lambda: {
                "response": {
                    "docs": [{
                        "hgnc_id": "HGNC:5",
                        "symbol": "A1BG",
                        "entrez_id": "1"
                    }]
                }
            }
        )
        
        # Mock NCBI response
        ncbi_response = Mock(
            status_code=200,
            text="<Entrezgene-Set><Entrezgene><Entrezgene_summary>Test</Entrezgene_summary></Entrezgene></Entrezgene-Set>"
        )
        
        mock_get.side_effect = [hgnc_response, ncbi_response]
        
        service = GeneService()
        report = service.fetch_complete_report("HGNC:5")
        
        assert report["hgnc"]["symbol"] == "A1BG"
        assert report["ncbi"]["entrez_id"] == "1"
        assert mock_get.call_count == 2
```

---

## Step 6: Running Tests

```bash
# Run all tests
pytest tests/ -v

# Run with coverage
pytest tests/ --cov=src --cov-report=html

# Run specific test file
pytest tests/test_hgnc_client.py -v

# Run tests matching pattern
pytest tests/ -k "hgnc" -v
```

---

## Summary

With OpenCARL, your development preferences are always present:

1. **Mention "test"** → TDD rules load
2. **Mention "implement"** → Code quality rules load  
3. **Mention "api"** → Error handling rules load

No need to repeat these preferences every session. They're automatically injected when relevant.

---

## Next Steps

Use `/opencarl` commands to extend your setup:

```bash
# Create a TESTING domain for pytest-specific rules
/opencarl create TESTING --recall 'pytest, assert, mock, fixture'
/opencarl add rule TESTING 'Use descriptive test names that explain the behavior'
/opencarl add rule TESTING 'One assertion per test when possible'

# Create a PYTHON domain for Python conventions
/opencarl create PYTHON --recall 'python, py, pip, import'
/opencarl add rule PYTHON 'Follow PEP 8 style guidelines'
/opencarl add rule PYTHON 'Use f-strings for string formatting'

# Create star-commands for common workflows
/opencarl add command tdd '*tdd - Test-driven development workflow'
/opencarl add command tdd 'Write the test first, then implement'
/opencarl add command tdd 'Run tests after each change'

/opencarl add command review '*review - Code review checklist'
/opencarl add command review 'Check for edge cases'
/opencarl add command review 'Verify error handling'
```

**Other useful commands:**

| Command | Description |
|---------|-------------|
| `/opencarl list domains` | See all configured domains |
| `/opencarl view DEVELOPMENT` | View rules in a domain |
| `/opencarl edit DEVELOPMENT 2 'New rule text'` | Edit a specific rule |
| `/opencarl toggle TESTING inactive` | Temporarily disable a domain |
| `/opencarl suggest 'Use dataclasses for data containers'` | Get domain suggestions |

See the [full documentation](https://krisgray.github.io/opencarl/) for more on creating custom domains and star-commands.

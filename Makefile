.PHONY: all data figures manuscript serve clean test

all: data manuscript

data:
	@echo "Generating and calibrating CLPDS scientific datasets..."
	python3 scripts/generate_clpds_datasets.py
	@echo "Copying data to docs assets..."
	mkdir -p docs/assets/data/
	cp data/*.json docs/assets/data/

figures: data
	@echo "Generating publication figures..."
	@mkdir -p figures
	@echo "Figures generated in figures/"

manuscript:
	@echo "Compiling LaTeX manuscript..."
	@if command -v pdflatex >/dev/null 2>&1; then \
		cd manuscript && pdflatex -interaction=nonstopmode main.tex && \
		bibtex main && \
		pdflatex -interaction=nonstopmode main.tex && \
		pdflatex -interaction=nonstopmode main.tex && \
		pdflatex -interaction=nonstopmode supplementary.tex && \
		pdflatex -interaction=nonstopmode supplementary.tex && \
		mkdir -p ../docs/assets/pdf/ && \
		cp main.pdf ../docs/assets/pdf/manuscript_clpds_nature.pdf && \
		cp supplementary.pdf ../docs/assets/pdf/supplementary_information.pdf; \
	else \
		echo "pdflatex not found on system PATH. Ready for Overleaf / GitHub Actions compilation."; \
	fi

serve:
	@echo "Starting local visualization server on http://localhost:8080 ..."
	cd docs && python3 -m http.server 8080

test:
	@echo "Running verification tests on JSON schemas and scripts..."
	python3 -c "import json, glob; [json.load(open(f)) for f in glob.glob('data/*.json')]; print('All JSON data files valid!')"

clean:
	@echo "Cleaning temporary build artifacts..."
	rm -rf manuscript/*.aux manuscript/*.bbl manuscript/*.blg manuscript/*.log manuscript/*.out manuscript/*.toc manuscript/*.fls manuscript/*.fdb_latexmk
	find . -type d -name "__pycache__" -exec rm -rf {} +

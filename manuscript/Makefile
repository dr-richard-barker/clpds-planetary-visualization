.PHONY: all clean main supplementary

all: main supplementary

main:
	pdflatex -interaction=nonstopmode main.tex
	bibtex main || true
	pdflatex -interaction=nonstopmode main.tex
	pdflatex -interaction=nonstopmode main.tex

supplementary:
	pdflatex -interaction=nonstopmode supplementary.tex
	pdflatex -interaction=nonstopmode supplementary.tex

clean:
	rm -f *.aux *.bbl *.blg *.log *.out *.toc *.fls *.fdb_latexmk *.synctex.gz

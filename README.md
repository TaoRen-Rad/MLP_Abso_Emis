# A machine learning-based unified gray gas emissivity andabsorptivity model for H<sub>2</sub>O-CO<sub>2</sub>-CO-N<sub>2</sub> mixtures

## Introduction

The gray gas model is a valuable tool for quickly estimating the radiative transfer of gases by incorporating parameters such as emissivity and absorptivity. However, existing state-of-the-art gray gas mixture models rely on two-dimensional look-up tables and multiple approximation steps, resulting in reduced accuracy and efficiency. This study addresses these limitations by employing a multilayer perceptron neural network approach to develop accurate and efficient absorptivity calculation models. Remarkably, since absorptivity equals emissivity when the absorbing gases and emitting wall surface have the same temperature, a unified model can predict both quantities accurately. The training datasets is calculated based on the line-by-line integration from HITEMP-2010. Two unified models, based on different spectral line-shape models (pseudo-Lorentz and Alberti cut-off), were provided. To enhance user accessibility and usability, we developed a web-based application serving as a graphical user interface for the models, conveniently accessible via a web browser.

## Dependencies

Not dependent on any external libraries. The webpage can be run on most modern browsers. Edge and Safari have been tested and confirmed to work.

## Quick Start

Clone the repository and open `index.html` within a browser.

* Click `calculator` in the menu to perform calculations.
* Click `plot` in the menu to generate emissivity/absorptivity charts.
Two spectral lineshapes, namely Alberti-cut-off lineshape and the Pseudo-Lorentz lineshape can be chosen.

**The webpage required Internet access to load necessary external script and model parameter files.** The model parameter files are large and may take a while to load (less than one minute, usually within a couple of seconds). Please be patient. These files are hosted on GitHub. If they cannot be loaded properly, please check your network status.

## Citation
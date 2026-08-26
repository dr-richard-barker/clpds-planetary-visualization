---
layout: default
title: "Data Explorer"
---

<div class="card">
    <h2><i class="fas fa-database"></i> CLPDS Scientific Datasets & Data Products</h2>
    <p>All data products processed in this platform originate from the <strong>China Lunar and Planetary Data Release System (CLPDS)</strong>. Below are direct access tables, data level definitions, and downloadable FAIR-compliant JSON data files.</p>
</div>

<div class="card">
    <h3><i class="fas fa-file-download"></i> Downloadable Processed Datasets (JSON)</h3>
    <div class="table-responsive">
        <table>
            <thead>
                <tr>
                    <th>Dataset File</th>
                    <th>Description & Content</th>
                    <th>Format</th>
                    <th>Download Link</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td><code>missions_metadata.json</code></td>
                    <td>Complete mission profiles, science objectives, payloads, and discoveries for Chang'e-1 to 6 and Tianwen-1.</td>
                    <td>JSON (15.6 KB)</td>
                    <td><a href="{{ '/assets/data/missions_metadata.json' | relative_url }}" class="btn btn-secondary" style="padding:0.2rem 0.5rem;font-size:0.75rem;" download><i class="fas fa-download"></i> Download</a></td>
                </tr>
                <tr>
                    <td><code>landing_sites_traverses.json</code></td>
                    <td>IAU coordinates, elevations, milestones, and waypoint coordinates for CE-3, CE-4, CE-5, CE-6, and Zhurong.</td>
                    <td>JSON (9.6 KB)</td>
                    <td><a href="{{ '/assets/data/landing_sites_traverses.json' | relative_url }}" class="btn btn-secondary" style="padding:0.2rem 0.5rem;font-size:0.75rem;" download><i class="fas fa-download"></i> Download</a></td>
                </tr>
                <tr>
                    <td><code>radargram_data.json</code></td>
                    <td>Calibrated GPR B-scans (CE-4 LPR 500 MHz and Zhurong RoRAD 25 MHz) with layer models and dielectric velocities.</td>
                    <td>JSON (517 KB)</td>
                    <td><a href="{{ '/assets/data/radargram_data.json' | relative_url }}" class="btn btn-secondary" style="padding:0.2rem 0.5rem;font-size:0.75rem;" download><i class="fas fa-download"></i> Download</a></td>
                </tr>
                <tr>
                    <td><code>spectral_library_data.json</code></td>
                    <td>Vis-NIR reflectance spectra (VNIS & LMS, including 2.85 µm water band) + MarSCoDe LIBS emission line libraries.</td>
                    <td>JSON (27.0 KB)</td>
                    <td><a href="{{ '/assets/data/spectral_library_data.json' | relative_url }}" class="btn btn-secondary" style="padding:0.2rem 0.5rem;font-size:0.75rem;" download><i class="fas fa-download"></i> Download</a></td>
                </tr>
                <tr>
                    <td><code>martian_climate_data.json</code></td>
                    <td>MCS diurnal cycles (temperature, pressure, wind), RoMAG magnetic anomalies, and Chang'e-4 LND radiation doses.</td>
                    <td>JSON (32.5 KB)</td>
                    <td><a href="{{ '/assets/data/martian_climate_data.json' | relative_url }}" class="btn btn-secondary" style="padding:0.2rem 0.5rem;font-size:0.75rem;" download><i class="fas fa-download"></i> Download</a></td>
                </tr>
            </tbody>
        </table>
    </div>
</div>

<div class="card">
    <h3><i class="fas fa-layer-group"></i> PDS Data Level Processing Standards</h3>
    <div class="table-responsive">
        <table>
            <thead>
                <tr>
                    <th>Data Level</th>
                    <th>Processing Description</th>
                    <th>Typical File Extensions</th>
                    <th>Example Products</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td><strong>Level 0</strong></td>
                    <td>Raw telemetry data streams received from Deep Space Stations.</td>
                    <td><code>.DAT</code>, <code>.RAW</code></td>
                    <td>Unprocessed downlink frames</td>
                </tr>
                <tr>
                    <td><strong>Level 1</strong></td>
                    <td>Decompressed, channel-separated raw instrument data with ancillary time and attitude tags.</td>
                    <td><code>.DAT</code>, <code>.TAB</code></td>
                    <td>Raw counts per detector channel</td>
                </tr>
                <tr>
                    <td><strong>Level 2A / 2B / 2C</strong></td>
                    <td>Radiometrically calibrated scientific values in physical units (reflectance, field intensity, voltage).</td>
                    <td><code>.2BL</code>, <code>.2CL</code>, <code>.IMG</code></td>
                    <td>VNIS reflectance cubes, LPR radar traces, MCS temperature</td>
                </tr>
                <tr>
                    <td><strong>Level 3</strong></td>
                    <td>Geometrically corrected, georeferenced, and orthorectified products.</td>
                    <td><code>.DOM</code>, <code>.DEM</code>, <code>.TIF</code></td>
                    <td>Digital Orthophoto Maps, Laser Altimeter DEMs</td>
                </tr>
                <tr>
                    <td><strong>Level 4</strong></td>
                    <td>Global composite mosaics, multispectral mineral maps, and high-level scientific models.</td>
                    <td><code>.TIF</code>, <code>.FITS</code>, <code>.H5</code></td>
                    <td>Global microwave brightness temp (CELMS), TiO2 maps</td>
                </tr>
            </tbody>
        </table>
    </div>
</div>

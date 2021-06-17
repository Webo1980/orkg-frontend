import React from 'react';
import { Button } from 'reactstrap';
import CheckboxTree from 'react-checkbox-tree';
import 'react-checkbox-tree/lib/react-checkbox-tree.css';
import { useSelector } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckSquare, faSquare, faChevronRight, faChevronDown, faPlusSquare, faMinusSquare } from '@fortawesome/free-solid-svg-icons';
import { updateResearchFieldNotifications, getRFTreeForNotifications } from 'services/backend/notifications';
import { toast } from 'react-toastify';
const nodes = [
    {
        value: 'R12',
        label: 'Life Sciences',
        children: [
            {
                value: 'R12.R13',
                label: 'Biochemistry, Biophysics, and Structural Biology',
                children: [
                    {
                        value: 'R12.R13.R14',
                        label: 'Biochemistry'
                    },
                    {
                        value: 'R12.R13.R15',
                        label: 'Biogeochemistry'
                    },
                    {
                        value: 'R12.R13.R16',
                        label: 'Biophysics'
                    },
                    {
                        value: 'R12.R13.R17',
                        label: 'Molecular Biology'
                    },
                    {
                        value: 'R12.R13.R18',
                        label: 'Structural Biology'
                    }
                ]
            },
            {
                value: 'R12.R19',
                label: 'Cell and Developmental Biology',
                children: [
                    {
                        value: 'R12.R19.R20',
                        label: 'Anatomy'
                    },
                    {
                        value: 'R12.R19.R21',
                        label: 'Cell Biology'
                    },
                    {
                        value: 'R12.R19.R22',
                        label: 'Developmental Biology'
                    },
                    {
                        value: 'R12.R19.R23',
                        label: 'Cancer Biology'
                    }
                ]
            },
            {
                value: 'R12.R24',
                label: 'Ecology and Evolutionary Biology',
                children: [
                    {
                        value: 'R12.R24.R25',
                        label: 'Behavior and Ethology'
                    },
                    {
                        value: 'R12.R24.R26',
                        label: 'Biogeochemistry'
                    },
                    {
                        value: 'R12.R24.R27',
                        label: 'Botany'
                    },
                    {
                        value: 'R12.R24.R28',
                        label: 'Evolution'
                    },
                    {
                        value: 'R12.R24.R29',
                        label: 'Population Biology'
                    },
                    {
                        value: 'R12.R24.R30',
                        label: 'Terrestrial and Aquatic Ecology'
                    }
                ]
            },
            {
                value: 'R12.R31',
                label: 'Public Health',
                children: [
                    {
                        value: 'R12.R31.R32',
                        label: 'Environmental Health'
                    },
                    {
                        value: 'R12.R31.R33',
                        label: 'Epidemiology'
                    },
                    {
                        value: 'R12.R31.R34',
                        label: 'Biostatistics'
                    }
                ]
            },
            {
                value: 'R12.R35',
                label: 'Genetics and Genomics',
                children: [
                    {
                        value: 'R12.R35.R36',
                        label: 'Computational Biology'
                    },
                    {
                        value: 'R12.R35.R37',
                        label: 'Genetics'
                    },
                    {
                        value: 'R12.R35.R38',
                        label: 'Genomics'
                    },
                    {
                        value: 'R12.R35.R39',
                        label: 'Molecular genetics'
                    }
                ]
            },
            {
                value: 'R12.R40',
                label: 'Immunology and Infectious Disease',
                children: [
                    {
                        value: 'R12.R40.R41',
                        label: 'Immunity'
                    },
                    {
                        value: 'R12.R40.R42',
                        label: 'Immunology of Infectious Disease'
                    },
                    {
                        value: 'R12.R40.R43',
                        label: 'Immunopathology'
                    },
                    {
                        value: 'R12.R40.R44',
                        label: 'Immunoprophylaxis and Therapy'
                    },
                    {
                        value: 'R12.R40.R45',
                        label: 'Pathology'
                    },
                    {
                        value: 'R12.R40.R46',
                        label: 'Parasitology'
                    }
                ]
            },
            {
                value: 'R12.R47',
                label: 'Biology/Integrated Biology/ Integrated Biomedical Sciences',
                children: [
                    {
                        value: 'R12.R47.R48',
                        label: 'Biomechanics'
                    },
                    {
                        value: 'R12.R47.R49',
                        label: 'Exercise Physiology'
                    },
                    {
                        value: 'R12.R47.R50',
                        label: 'Motor Control'
                    },
                    {
                        value: 'R12.R47.R51',
                        label: 'Psychology of Movement'
                    }
                ]
            },
            {
                value: 'R12.R52',
                label: 'Microbiology',
                children: [
                    {
                        value: 'R12.R52.R53',
                        label: 'Bacteriology'
                    },
                    {
                        value: 'R12.R52.R54',
                        label: 'Environmental Microbiology and Microbial Ecology'
                    },
                    {
                        value: 'R12.R52.R55',
                        label: 'Microbial Physiology'
                    },
                    {
                        value: 'R12.R52.R56',
                        label: 'Pathogenic Microbiology'
                    },
                    {
                        value: 'R12.R52.R57',
                        label: 'Virology'
                    }
                ]
            },
            {
                value: 'R12.R58',
                label: 'Neuroscience and Neurobiology',
                children: [
                    {
                        value: 'R12.R58.R59',
                        label: 'Behavioral Neurobiology'
                    },
                    {
                        value: 'R12.R58.R60',
                        label: 'Cognitive Neuroscience'
                    },
                    {
                        value: 'R12.R58.R61',
                        label: 'Computational Neuroscience'
                    },
                    {
                        value: 'R12.R58.R62',
                        label: 'Developmental Neuroscience'
                    },
                    {
                        value: 'R12.R58.R63',
                        label: 'Molecular and Cellular Neuroscience'
                    },
                    {
                        value: 'R12.R58.R64',
                        label: 'Systems Neuroscience'
                    }
                ]
            },
            {
                value: 'R12.R65',
                label: 'Nursing Pharmacology, Toxicology and Environmental Health',
                children: [
                    {
                        value: 'R12.R65.R66',
                        label: 'Environmental Health'
                    },
                    {
                        value: 'R12.R65.R67',
                        label: 'Medicinal Chemistry and Pharmaceutics'
                    },
                    {
                        value: 'R12.R65.R68',
                        label: 'Pharmacology'
                    },
                    {
                        value: 'R12.R65.R69',
                        label: 'Toxicology'
                    }
                ]
            },
            {
                value: 'R12.R70',
                label: 'Physiology',
                children: [
                    {
                        value: 'R12.R70.R71',
                        label: 'Cellular and Molecular Physiology'
                    },
                    {
                        value: 'R12.R70.R72',
                        label: 'Comparative and Evolutionary Physiology'
                    },
                    {
                        value: 'R12.R70.R73',
                        label: 'Endocrinology'
                    },
                    {
                        value: 'R12.R70.R74',
                        label: 'Exercise Physiology'
                    },
                    {
                        value: 'R12.R70.R75',
                        label: 'Systems and Integrative Physiology'
                    }
                ]
            },
            {
                value: 'R12.R76',
                label: 'Animal Sciences',
                children: [
                    {
                        value: 'R12.R76.R77',
                        label: 'Animal Sciences'
                    },
                    {
                        value: 'R12.R76.R78',
                        label: 'Aquaculture and Fisheries'
                    },
                    {
                        value: 'R12.R76.R79',
                        label: 'Dairy Science'
                    },
                    {
                        value: 'R12.R76.R80',
                        label: 'Poultry (or Avian) Science'
                    },
                    {
                        value: 'R12.R76.R81',
                        label: 'Zoology'
                    }
                ]
            },
            {
                value: 'R12.R82',
                label: 'Entomology Food Science',
                children: [
                    {
                        value: 'R12.R82.R83',
                        label: 'Food Processing'
                    },
                    {
                        value: 'R12.R82.R84',
                        label: 'Food Microbiology'
                    },
                    {
                        value: 'R12.R82.R85',
                        label: 'Food Chemistry'
                    },
                    {
                        value: 'R12.R82.R86',
                        label: 'Food Biotechnology'
                    }
                ]
            },
            {
                value: 'R12.R87',
                label: 'Forestry and Forest Sciences',
                children: [
                    {
                        value: 'R12.R87.R88',
                        label: 'Forest Biology'
                    },
                    {
                        value: 'R12.R87.R89',
                        label: 'Forest Management'
                    },
                    {
                        value: 'R12.R87.R90',
                        label: 'Wood Science and Pulp/Paper Technology'
                    }
                ]
            },
            {
                value: 'R12.R91',
                label: 'Nutrition',
                children: [
                    {
                        value: 'R12.R91.R92',
                        label: 'Comparative Nutrition'
                    },
                    {
                        value: 'R12.R91.R93',
                        label: 'Human and Clinical Nutrition'
                    },
                    {
                        value: 'R12.R91.R94',
                        label: 'International and Community Nutrition'
                    },
                    {
                        value: 'R12.R91.R95',
                        label: 'Molecular, Genetic, and Biochemical Nutrition'
                    },
                    {
                        value: 'R12.R91.R96',
                        label: 'Nutritional Epidemiology'
                    }
                ]
            },
            {
                value: 'R12.R97',
                label: 'Plant Sciences',
                children: [
                    {
                        value: 'R12.R97.R98',
                        label: 'Agronomy and Crop Sciences'
                    },
                    {
                        value: 'R12.R97.R99',
                        label: 'Botany'
                    },
                    {
                        value: 'R12.R97.R100',
                        label: 'Horticulture'
                    },
                    {
                        value: 'R12.R97.R101',
                        label: 'Plant Biology'
                    },
                    {
                        value: 'R12.R97.R102',
                        label: 'Plant Pathology'
                    },
                    {
                        value: 'R12.R97.R103',
                        label: 'Plant Breeding and Genetics'
                    }
                ]
            },
            {
                value: 'R12.R104',
                label: 'Bioinformatics'
            },
            {
                value: 'R12.R105',
                label: 'Biotechnology'
            },
            {
                value: 'R12.R106',
                label: 'Systems Biology'
            }
        ]
    },
    {
        value: 'R107',
        label: 'Physical Sciences & Mathematics',
        children: [
            {
                value: 'R107.R108',
                label: 'Applied Mathematics',
                children: [
                    {
                        value: 'R107.R108.R109',
                        label: 'Control Theory'
                    },
                    {
                        value: 'R107.R108.R110',
                        label: 'Dynamic Systems'
                    },
                    {
                        value: 'R107.R108.R111',
                        label: 'Non-linear Dynamics'
                    },
                    {
                        value: 'R107.R108.R112',
                        label: 'Numerical Analysis and Computation'
                    },
                    {
                        value: 'R107.R108.R113',
                        label: 'Partial Differential Equations'
                    },
                    {
                        value: 'R107.R108.R114',
                        label: 'Ordinary Differential Equations and Applied Dynamics'
                    }
                ]
            },
            {
                value: 'R107.R115',
                label: 'Astrophysics and Astronomy',
                children: [
                    {
                        value: 'R107.R115.R116',
                        label: 'Physical Processes'
                    },
                    {
                        value: 'R107.R115.R117',
                        label: 'Instrumentation'
                    },
                    {
                        value: 'R107.R115.R118',
                        label: 'The Sun and the Solar System'
                    },
                    {
                        value: 'R107.R115.R119',
                        label: 'Stars, Interstellar Medium and the Galaxy'
                    },
                    {
                        value: 'R107.R115.R120',
                        label: 'External Galaxies'
                    },
                    {
                        value: 'R107.R115.R121',
                        label: 'Cosmology'
                    }
                ]
            },
            {
                value: 'R107.R122',
                label: 'Chemistry',
                children: [
                    {
                        value: 'R107.R122.R123',
                        label: 'Analytical Chemistry'
                    },
                    {
                        value: 'R107.R122.R124',
                        label: 'Biochemistry'
                    },
                    {
                        value: 'R107.R122.R125',
                        label: 'Environmental Chemistry'
                    },
                    {
                        value: 'R107.R122.R126',
                        label: 'Materials Chemistry'
                    },
                    {
                        value: 'R107.R122.R127',
                        label: 'Medicinal-Pharmaceutical Chemistry'
                    },
                    {
                        value: 'R107.R122.R128',
                        label: 'Inorganic Chemistry'
                    },
                    {
                        value: 'R107.R122.R129',
                        label: 'Organic Chemistry'
                    },
                    {
                        value: 'R107.R122.R130',
                        label: 'Physical Chemistry'
                    },
                    {
                        value: 'R107.R122.R131',
                        label: 'Polymer Chemistry'
                    }
                ]
            },
            {
                value: 'R107.R132',
                label: 'Computer Sciences',
                children: [
                    {
                        value: 'R107.R132.R133',
                        label: 'Artificial Intelligence/Robotics'
                    },
                    {
                        value: 'R107.R132.R134',
                        label: 'Computer and Systems Architecture'
                    },
                    {
                        value: 'R107.R132.R135',
                        label: 'Databases/Information Systems'
                    },
                    {
                        value: 'R107.R132.R136',
                        label: 'Graphics/Human Computer Interfaces'
                    },
                    {
                        value: 'R107.R132.R137',
                        label: 'Numerical Analysis/Scientific Computing'
                    },
                    {
                        value: 'R107.R132.R138',
                        label: 'Programming Languages/Compilers'
                    },
                    {
                        value: 'R107.R132.R139',
                        label: 'OS/Networks'
                    },
                    {
                        value: 'R107.R132.R140',
                        label: 'Software Engineering'
                    },
                    {
                        value: 'R107.R132.R141',
                        label: 'Theory/Algorithms'
                    }
                ]
            },
            {
                value: 'R107.R142',
                label: 'Earth Sciences',
                children: [
                    {
                        value: 'R107.R142.R143',
                        label: 'Biogeochemistry'
                    },
                    {
                        value: 'R107.R142.R144',
                        label: 'Cosmochemistry'
                    },
                    {
                        value: 'R107.R142.R145',
                        label: 'Environmental Sciences'
                    },
                    {
                        value: 'R107.R142.R146',
                        label: 'Geology'
                    },
                    {
                        value: 'R107.R142.R147',
                        label: 'Geochemistry'
                    },
                    {
                        value: 'R107.R142.R148',
                        label: 'Geophysics and Seismology'
                    },
                    {
                        value: 'R107.R142.R149',
                        label: 'Glaciology'
                    },
                    {
                        value: 'R107.R142.R150',
                        label: 'Mineral Physics'
                    },
                    {
                        value: 'R107.R142.R151',
                        label: 'Paleobiology'
                    },
                    {
                        value: 'R107.R142.R152',
                        label: 'Paleontology'
                    },
                    {
                        value: 'R107.R142.R153',
                        label: 'Soil Science'
                    },
                    {
                        value: 'R107.R142.R154',
                        label: 'Tectonics and Structure'
                    },
                    {
                        value: 'R107.R142.R155',
                        label: 'Vulcanology'
                    }
                ]
            },
            {
                value: 'R107.R156',
                label: 'Mathematics',
                children: [
                    {
                        value: 'R107.R156.R157',
                        label: 'Algebra'
                    },
                    {
                        value: 'R107.R156.R158',
                        label: 'Algebraic Geometry'
                    },
                    {
                        value: 'R107.R156.R159',
                        label: 'Analysis'
                    },
                    {
                        value: 'R107.R156.R160',
                        label: 'Discrete Mathematics and Combinatorics'
                    },
                    {
                        value: 'R107.R156.R161',
                        label: 'Dynamics/Dynamical Systems'
                    },
                    {
                        value: 'R107.R156.R162',
                        label: 'Geometry and Topology'
                    },
                    {
                        value: 'R107.R156.R163',
                        label: 'Harmonic Analysis and Representation'
                    },
                    {
                        value: 'R107.R156.R164',
                        label: 'Logic and Foundations'
                    },
                    {
                        value: 'R107.R156.R165',
                        label: 'Number Theory'
                    },
                    {
                        value: 'R107.R156.R166',
                        label: 'Set Theory'
                    }
                ]
            },
            {
                value: 'R107.R167',
                label: 'Oceanography and Atmospheric Sciences and Meteorology',
                children: [
                    {
                        value: 'R107.R167.R168',
                        label: 'Atmospheric Sciences'
                    },
                    {
                        value: 'R107.R167.R169',
                        label: 'Climate'
                    },
                    {
                        value: 'R107.R167.R170',
                        label: 'Fresh Water Studies'
                    },
                    {
                        value: 'R107.R167.R171',
                        label: 'Meteorology'
                    },
                    {
                        value: 'R107.R167.R172',
                        label: 'Oceanography'
                    }
                ]
            },
            {
                value: 'R107.R173',
                label: 'Physics',
                children: [
                    {
                        value: 'R107.R173.R174',
                        label: 'Astronomy and Astrophysics'
                    },
                    {
                        value: 'R107.R173.R175',
                        label: 'Atomic, Molecular and Optical Physics'
                    },
                    {
                        value: 'R107.R173.R176',
                        label: 'Biological and Chemical Physics'
                    },
                    {
                        value: 'R107.R173.R177',
                        label: 'Condensed Matter Physics'
                    },
                    {
                        value: 'R107.R173.R178',
                        label: 'Cosmology, Relativity, and Gravity'
                    },
                    {
                        value: 'R107.R173.R179',
                        label: 'Elementary Particles and Fields and String Theory'
                    },
                    {
                        value: 'R107.R173.R180',
                        label: 'Engineering Physics'
                    },
                    {
                        value: 'R107.R173.R181',
                        label: 'Fluid Dynamics'
                    },
                    {
                        value: 'R107.R173.R182',
                        label: 'Non-linear Dynamics'
                    },
                    {
                        value: 'R107.R173.R183',
                        label: 'Nuclear'
                    },
                    {
                        value: 'R107.R173.R184',
                        label: 'Optics'
                    },
                    {
                        value: 'R107.R173.R185',
                        label: 'Plasma and Beam Physics'
                    },
                    {
                        value: 'R107.R173.R186',
                        label: 'Quantum Physics'
                    }
                ]
            },
            {
                value: 'R107.R187',
                label: 'Statistics and Probability',
                children: [
                    {
                        value: 'R107.R187.R188',
                        label: 'Applied Statistics'
                    },
                    {
                        value: 'R107.R187.R189',
                        label: 'Biostatistics'
                    },
                    {
                        value: 'R107.R187.R190',
                        label: 'Biometry'
                    },
                    {
                        value: 'R107.R187.R191',
                        label: 'Probability'
                    },
                    {
                        value: 'R107.R187.R192',
                        label: 'Statistical Methodology'
                    },
                    {
                        value: 'R107.R187.R193',
                        label: 'Statistical Theory'
                    }
                ]
            }
        ]
    },
    {
        value: 'R194',
        label: 'Engineering',
        children: [
            {
                value: 'R194.R195',
                label: 'Aerospace Engineering',
                children: [
                    {
                        value: 'R194.R195.R196',
                        label: 'Aeronautical Vehicles'
                    },
                    {
                        value: 'R194.R195.R197',
                        label: 'Space Vehicles'
                    },
                    {
                        value: 'R194.R195.R198',
                        label: 'Systems Engineering and Multidisciplinary Design Optimization'
                    },
                    {
                        value: 'R194.R195.R199',
                        label: 'Aerodynamics and Fluid Mechanics'
                    },
                    {
                        value: 'R194.R195.R200',
                        label: 'Astrodynamics'
                    },
                    {
                        value: 'R194.R195.R201',
                        label: 'Structures and Materials'
                    },
                    {
                        value: 'R194.R195.R202',
                        label: 'Propulsion and Power'
                    },
                    {
                        value: 'R194.R195.R203',
                        label: 'Navigation, Guidance, Control and Dynamics'
                    },
                    {
                        value: 'R194.R195.R204',
                        label: 'Multi-Vehicle Systems and Air Traffic Control'
                    }
                ]
            },
            {
                value: 'R194.R205',
                label: 'Biomedical Engineering and Bioengineering',
                children: [
                    {
                        value: 'R194.R205.R206',
                        label: 'Biological Engineering'
                    },
                    {
                        value: 'R194.R205.R207',
                        label: 'Bioelectrical and neuroengineering'
                    },
                    {
                        value: 'R194.R205.R208',
                        label: 'Bioimaging and biomedical optics'
                    },
                    {
                        value: 'R194.R205.R209',
                        label: 'Biomaterials'
                    },
                    {
                        value: 'R194.R205.R210',
                        label: 'Biomechanics and biotransport'
                    },
                    {
                        value: 'R194.R205.R211',
                        label: 'Biomedical devices and instrumentation'
                    },
                    {
                        value: 'R194.R205.R212',
                        label: 'Molecular, cellular, and tissue engineering'
                    },
                    {
                        value: 'R194.R205.R213',
                        label: 'Systems and integrative engineering'
                    }
                ]
            },
            {
                value: 'R194.R214',
                label: 'Chemical Engineering',
                children: [
                    {
                        value: 'R194.R214.R215',
                        label: 'Biochemical and Biomolecular Engineering'
                    },
                    {
                        value: 'R194.R214.R216',
                        label: 'Catalysis and Reaction Engineering'
                    },
                    {
                        value: 'R194.R214.R217',
                        label: 'Complex Fluids'
                    },
                    {
                        value: 'R194.R214.R218',
                        label: 'Membrane Science'
                    },
                    {
                        value: 'R194.R214.R219',
                        label: 'Petroleum Engineering'
                    },
                    {
                        value: 'R194.R214.R220',
                        label: 'Polymer Science'
                    },
                    {
                        value: 'R194.R214.R221',
                        label: 'Process Control and Systems'
                    },
                    {
                        value: 'R194.R214.R222',
                        label: 'Thermodynamics'
                    },
                    {
                        value: 'R194.R214.R223',
                        label: 'Transport Phenomena'
                    }
                ]
            },
            {
                value: 'R194.R224',
                label: 'Civil and Environmental Engineering',
                children: [
                    {
                        value: 'R194.R224.R225',
                        label: 'Civil Engineering'
                    },
                    {
                        value: 'R194.R224.R226',
                        label: 'Construction Engineering/management'
                    },
                    {
                        value: 'R194.R224.R227',
                        label: 'Environmental Engineering'
                    },
                    {
                        value: 'R194.R224.R228',
                        label: 'Geotechnical Engineering'
                    },
                    {
                        value: 'R194.R224.R229',
                        label: 'Structural Engineering'
                    }
                ]
            },
            {
                value: 'R194.R230',
                label: 'Computer Engineering',
                children: [
                    {
                        value: 'R194.R230.R231',
                        label: 'Computer and Systems Architecture'
                    },
                    {
                        value: 'R194.R230.R232',
                        label: 'Digital Circuits'
                    },
                    {
                        value: 'R194.R230.R233',
                        label: 'Data Storage Systems'
                    },
                    {
                        value: 'R194.R230.R234',
                        label: 'Digital Communications and Networking'
                    },
                    {
                        value: 'R194.R230.R235',
                        label: 'Hardware Systems'
                    },
                    {
                        value: 'R194.R230.R236',
                        label: 'Robotics'
                    }
                ]
            },
            {
                value: 'R194.R237',
                label: 'Electrical and Computer Engineering',
                children: [
                    {
                        value: 'R194.R237.R238',
                        label: 'Biomedical'
                    },
                    {
                        value: 'R194.R237.R239',
                        label: 'Computer Engineering'
                    },
                    {
                        value: 'R194.R237.R240',
                        label: 'Controls and Control Theory'
                    },
                    {
                        value: 'R194.R237.R241',
                        label: 'Electrical and Electronics'
                    },
                    {
                        value: 'R194.R237.R242',
                        label: 'Electromagnetics and photonics'
                    },
                    {
                        value: 'R194.R237.R243',
                        label: 'Electronic Devices and Semiconductor Manufacturing'
                    },
                    {
                        value: 'R194.R237.R244',
                        label: 'Nanotechnology fabrication'
                    },
                    {
                        value: 'R194.R237.R245',
                        label: 'Power and Energy'
                    },
                    {
                        value: 'R194.R237.R246',
                        label: 'Signal Processing'
                    },
                    {
                        value: 'R194.R237.R247',
                        label: 'Systems and Communications'
                    },
                    {
                        value: 'R194.R237.R248',
                        label: 'VLSI and circuits: Embedded/Hardware Systems'
                    }
                ]
            },
            {
                value: 'R194.R249',
                label: 'Engineering Science and Materials (not elsewhere classified)',
                children: [
                    {
                        value: 'R194.R249.R250',
                        label: 'Engineering Mechanics'
                    },
                    {
                        value: 'R194.R249.R251',
                        label: 'Dynamics/Dynamical Systems'
                    },
                    {
                        value: 'R194.R249.R252',
                        label: 'Non-linear Dynamics'
                    },
                    {
                        value: 'R194.R249.R253',
                        label: 'Mechanics of Materials'
                    }
                ]
            },
            {
                value: 'R194.R254',
                label: 'Materials Science and Engineering',
                children: [
                    {
                        value: 'R194.R254.R255',
                        label: 'Biology and Biomimetic Materials'
                    },
                    {
                        value: 'R194.R254.R256',
                        label: 'Ceramic Materials'
                    },
                    {
                        value: 'R194.R254.R257',
                        label: 'Metallurgy'
                    },
                    {
                        value: 'R194.R254.R258',
                        label: 'Polymer and Organic Materials'
                    },
                    {
                        value: 'R194.R254.R259',
                        label: 'Semiconductor and Optical Materials'
                    },
                    {
                        value: 'R194.R254.R260',
                        label: 'Structural Materials'
                    }
                ]
            },
            {
                value: 'R194.R261',
                label: 'Mechanical Engineering',
                children: [
                    {
                        value: 'R194.R261.R262',
                        label: 'Acoustics, Dynamics, and Controls'
                    },
                    {
                        value: 'R194.R261.R263',
                        label: 'Applied Mechanics'
                    },
                    {
                        value: 'R194.R261.R264',
                        label: 'Biomechanical Engineering'
                    },
                    {
                        value: 'R194.R261.R265',
                        label: 'Computer-Aided Engineering and Design'
                    },
                    {
                        value: 'R194.R261.R266',
                        label: 'Electro-Mechanical Systems'
                    },
                    {
                        value: 'R194.R261.R267',
                        label: 'Energy Systems'
                    },
                    {
                        value: 'R194.R261.R268',
                        label: 'Heat Transfer, Combustion'
                    },
                    {
                        value: 'R194.R261.R269',
                        label: 'Manufacturing'
                    },
                    {
                        value: 'R194.R261.R270',
                        label: 'Ocean Engineering'
                    },
                    {
                        value: 'R194.R261.R271',
                        label: 'Tribology'
                    }
                ]
            },
            {
                value: 'R194.R272',
                label: 'Operations Research, Systems Engineering and Industrial Engineering',
                children: [
                    {
                        value: 'R194.R272.R273',
                        label: 'Ergonomics'
                    },
                    {
                        value: 'R194.R272.R274',
                        label: 'Industrial Engineering'
                    },
                    {
                        value: 'R194.R272.R275',
                        label: 'Operational Research'
                    },
                    {
                        value: 'R194.R272.R276',
                        label: 'Systems Engineering'
                    }
                ]
            },
            {
                value: 'R194.R277',
                label: 'Computational Engineering'
            },
            {
                value: 'R194.R278',
                label: 'Information Science'
            },
            {
                value: 'R194.R279',
                label: 'Nanoscience and Nanotechnology'
            },
            {
                value: 'R194.R280',
                label: 'Nuclear Engineering'
            }
        ]
    },
    {
        value: 'R281',
        label: 'Social and Behavioral Sciences',
        children: [
            {
                value: 'R281.R282',
                label: 'Agricultural and Resource Economics'
            },
            {
                value: 'R281.R283',
                label: 'Anthropology',
                children: [
                    {
                        value: 'R281.R283.R284',
                        label: 'Archaeological'
                    },
                    {
                        value: 'R281.R283.R285',
                        label: 'Biological and Physical'
                    },
                    {
                        value: 'R281.R283.R286',
                        label: 'Linguistic Anthrolpology'
                    },
                    {
                        value: 'R281.R283.R287',
                        label: 'Social and Cultural'
                    }
                ]
            },
            {
                value: 'R281.R288',
                label: 'Communication',
                children: [
                    {
                        value: 'R281.R288.R289',
                        label: 'Broadcast/Video Studies'
                    },
                    {
                        value: 'R281.R288.R290',
                        label: 'Communication Technology and New Media'
                    },
                    {
                        value: 'R281.R288.R291',
                        label: 'Critical and Cultural Studies'
                    },
                    {
                        value: 'R281.R288.R292',
                        label: 'Gender, Race, Sexuality, and Ethnicity in Communication'
                    },
                    {
                        value: 'R281.R288.R293',
                        label: 'Health Communication'
                    },
                    {
                        value: 'R281.R288.R294',
                        label: 'International and Intercultural Communication'
                    },
                    {
                        value: 'R281.R288.R295',
                        label: 'Interpersonal/Small Group Communication'
                    },
                    {
                        value: 'R281.R288.R296',
                        label: 'Journalism Studies'
                    },
                    {
                        value: 'R281.R288.R297',
                        label: 'Mass Communication'
                    },
                    {
                        value: 'R281.R288.R298',
                        label: 'Organizational Communication'
                    },
                    {
                        value: 'R281.R288.R299',
                        label: 'Public Relations/Advertising'
                    },
                    {
                        value: 'R281.R288.R300',
                        label: 'Social Influence and Political Communication'
                    },
                    {
                        value: 'R281.R288.R301',
                        label: 'Speech and Rhetorical Studies'
                    }
                ]
            },
            {
                value: 'R281.R302',
                label: 'Economics',
                children: [
                    {
                        value: 'R281.R302.R303',
                        label: 'Behavioral Economics'
                    },
                    {
                        value: 'R281.R302.R304',
                        label: 'Econometrics'
                    },
                    {
                        value: 'R281.R302.R305',
                        label: 'Economic History'
                    },
                    {
                        value: 'R281.R302.R306',
                        label: 'Economic Theory'
                    },
                    {
                        value: 'R281.R302.R307',
                        label: 'Growth and Development'
                    },
                    {
                        value: 'R281.R302.R308',
                        label: 'Industrial Organization'
                    },
                    {
                        value: 'R281.R302.R309',
                        label: 'International Economics'
                    },
                    {
                        value: 'R281.R302.R310',
                        label: 'Labor Economics'
                    },
                    {
                        value: 'R281.R302.R311',
                        label: 'Macroeconomics'
                    },
                    {
                        value: 'R281.R302.R312',
                        label: 'Public Economics'
                    }
                ]
            },
            {
                value: 'R281.R313',
                label: 'Geography',
                children: [
                    {
                        value: 'R281.R313.R314',
                        label: 'Physical and Environmental Geography'
                    },
                    {
                        value: 'R281.R313.R315',
                        label: 'Human Geography'
                    },
                    {
                        value: 'R281.R313.R316',
                        label: 'Nature and Society Relations'
                    },
                    {
                        value: 'R281.R313.R317',
                        label: 'Geographic Information Sciences'
                    }
                ]
            },
            {
                value: 'R281.R318',
                label: 'Linguistics',
                children: [
                    {
                        value: 'R281.R318.R319',
                        label: 'Anthropological Linguistics/Sociolinguistics'
                    },
                    {
                        value: 'R281.R318.R320',
                        label: 'Applied Linguistics'
                    },
                    {
                        value: 'R281.R318.R321',
                        label: 'Comparative and Historical Linguistics'
                    },
                    {
                        value: 'R281.R318.R322',
                        label: 'Computational Linguistics'
                    },
                    {
                        value: 'R281.R318.R323',
                        label: 'Discourse/Text Linguistics'
                    },
                    {
                        value: 'R281.R318.R324',
                        label: 'First/Second Language Acquisition'
                    },
                    {
                        value: 'R281.R318.R325',
                        label: 'Typological Linguistics and Linguistic Diversity'
                    },
                    {
                        value: 'R281.R318.R326',
                        label: 'Language Description/Documentation'
                    },
                    {
                        value: 'R281.R318.R327',
                        label: 'Morphology'
                    },
                    {
                        value: 'R281.R318.R328',
                        label: 'Phonetics/Phonology'
                    },
                    {
                        value: 'R281.R318.R329',
                        label: 'Psycholinguistics/Neurolinguistics'
                    },
                    {
                        value: 'R281.R318.R330',
                        label: 'Semantics/Pragmatics'
                    },
                    {
                        value: 'R281.R318.R331',
                        label: 'Syntax'
                    }
                ]
            },
            {
                value: 'R281.R332',
                label: 'Political Science',
                children: [
                    {
                        value: 'R281.R332.R333',
                        label: 'American Politics'
                    },
                    {
                        value: 'R281.R332.R334',
                        label: 'Comparative Politics'
                    },
                    {
                        value: 'R281.R332.R335',
                        label: 'International Relations'
                    },
                    {
                        value: 'R281.R332.R336',
                        label: 'Models and Methods'
                    },
                    {
                        value: 'R281.R332.R337',
                        label: 'Political Theory'
                    }
                ]
            },
            {
                value: 'R281.R338',
                label: 'Public Affairs, Public Policy and Public Administration',
                children: [
                    {
                        value: 'R281.R338.R339',
                        label: 'Public Administration'
                    },
                    {
                        value: 'R281.R338.R340',
                        label: 'Public Affairs'
                    },
                    {
                        value: 'R281.R338.R341',
                        label: 'Public Policy'
                    },
                    {
                        value: 'R281.R338.R342',
                        label: 'Urban Studies'
                    }
                ]
            },
            {
                value: 'R281.R343',
                label: 'Psychology (Ph.D. programs only)',
                children: [
                    {
                        value: 'R281.R343.R344',
                        label: 'Biological Psychology'
                    },
                    {
                        value: 'R281.R343.R345',
                        label: 'Clinical Psychology (Ph.D. programs only)'
                    },
                    {
                        value: 'R281.R343.R346',
                        label: 'Cognition and Perception'
                    },
                    {
                        value: 'R281.R343.R347',
                        label: 'Cognitive Psychology'
                    },
                    {
                        value: 'R281.R343.R348',
                        label: 'Community Psychology'
                    },
                    {
                        value: 'R281.R343.R349',
                        label: 'Developmental Psychology'
                    },
                    {
                        value: 'R281.R343.R350',
                        label: 'Health Psychology'
                    },
                    {
                        value: 'R281.R343.R351',
                        label: 'Industrial and Organizational Psychology'
                    },
                    {
                        value: 'R281.R343.R352',
                        label: 'Personality and Social Contexts'
                    },
                    {
                        value: 'R281.R343.R353',
                        label: 'Social Psychology'
                    }
                ]
            },
            {
                value: 'R281.R354',
                label: 'Sociology',
                children: [
                    {
                        value: 'R281.R354.R355',
                        label: 'Demography, Population, and Ecology'
                    },
                    {
                        value: 'R281.R354.R356',
                        label: 'Family, Life Course, and Society'
                    },
                    {
                        value: 'R281.R354.R357',
                        label: 'Gender and Sexuality'
                    },
                    {
                        value: 'R281.R354.R358',
                        label: 'Inequality and Stratification'
                    },
                    {
                        value: 'R281.R354.R359',
                        label: 'Medicine and Health'
                    },
                    {
                        value: 'R281.R354.R360',
                        label: 'Methodologies : Quantitative, Qualitative, Comparative, and Historical'
                    },
                    {
                        value: 'R281.R354.R361',
                        label: 'Place and Environment'
                    },
                    {
                        value: 'R281.R354.R362',
                        label: 'Politics and Social Change'
                    },
                    {
                        value: 'R281.R354.R363',
                        label: 'Race and Ethnicity'
                    },
                    {
                        value: 'R281.R354.R364',
                        label: 'Regional Sociology'
                    },
                    {
                        value: 'R281.R354.R365',
                        label: 'Rural sociology'
                    },
                    {
                        value: 'R281.R354.R366',
                        label: 'Social Control, Law, Crime, and Deviance'
                    },
                    {
                        value: 'R281.R354.R367',
                        label: 'Social Psychology and Interaction'
                    },
                    {
                        value: 'R281.R354.R368',
                        label: 'Sociology of Culture'
                    },
                    {
                        value: 'R281.R354.R369',
                        label: 'Theory, Knowledge and Science'
                    },
                    {
                        value: 'R281.R354.R370',
                        label: 'Work, Economy and Organizations'
                    },
                    {
                        value: 'R281.R354.R371',
                        label: 'Criminology'
                    }
                ]
            },
            {
                value: 'R281.R372',
                label: 'Criminology and Criminal Justice'
            },
            {
                value: 'R281.R373',
                label: 'Science and Technology Studies'
            },
            {
                value: 'R281.R374',
                label: 'Urban Studies and Planning'
            }
        ]
    },
    {
        value: 'R375',
        label: 'Arts and Humanities',
        children: [
            {
                value: 'R375.R376',
                label: 'American Studies',
                children: [
                    {
                        value: 'R375.R376.R377',
                        label: 'American Film Studies'
                    },
                    {
                        value: 'R375.R376.R378',
                        label: 'American Material Culture'
                    },
                    {
                        value: 'R375.R376.R379',
                        label: 'American Popular Culture'
                    },
                    {
                        value: 'R375.R376.R380',
                        label: 'Ethnic Studies'
                    }
                ]
            },
            {
                value: 'R375.R381',
                label: 'Classics',
                children: [
                    {
                        value: 'R375.R381.R382',
                        label: 'Ancient History (Greek and Roman through Late Antiquity)'
                    },
                    {
                        value: 'R375.R381.R383',
                        label: 'Ancient Philosophy'
                    },
                    {
                        value: 'R375.R381.R384',
                        label: 'Byzantine and Modern Greek'
                    },
                    {
                        value: 'R375.R381.R385',
                        label: 'Classical Archaeology and Art History'
                    },
                    {
                        value: 'R375.R381.R386',
                        label: 'Classical Literature and Philology'
                    },
                    {
                        value: 'R375.R381.R387',
                        label: 'Indo-European Linguistics and Philology'
                    }
                ]
            },
            {
                value: 'R375.R388',
                label: 'Comparative Literature'
            },
            {
                value: 'R375.R389',
                label: 'English Language and Literature',
                children: [
                    {
                        value: 'R375.R389.R390',
                        label: 'Literature in English, British Isles'
                    },
                    {
                        value: 'R375.R389.R391',
                        label: 'Literature in English, Anglophone (other than British Isles and North America)'
                    },
                    {
                        value: 'R375.R389.R392',
                        label: 'Literature in English, North America (other than ethnic and minority)'
                    },
                    {
                        value: 'R375.R389.R393',
                        label: 'Literature in English, North America, ethnic and minority'
                    },
                    {
                        value: 'R375.R389.R394',
                        label: 'Feminist, Gender and Sexuality Studies'
                    },
                    {
                        value: 'R375.R389.R395',
                        label: 'Rhetoric and Composition'
                    }
                ]
            },
            {
                value: 'R375.R396',
                label: 'French and Francophone Language and Literature',
                children: [
                    {
                        value: 'R375.R396.R397',
                        label: 'French Linguistics'
                    },
                    {
                        value: 'R375.R396.R398',
                        label: 'French and Francophone Literature'
                    }
                ]
            },
            {
                value: 'R375.R399',
                label: 'German Language and Literature',
                children: [
                    {
                        value: 'R375.R399.R400',
                        label: 'German Linguistics'
                    },
                    {
                        value: 'R375.R399.R401',
                        label: 'German Literature'
                    }
                ]
            },
            {
                value: 'R375.R402',
                label: 'Language, Societies, and Cultures',
                children: [
                    {
                        value: 'R375.R402.R403',
                        label: 'African Languages and Societies'
                    },
                    {
                        value: 'R375.R402.R404',
                        label: 'East Asian Languages and Societies'
                    },
                    {
                        value: 'R375.R402.R405',
                        label: 'European Languages and Societies (not elsewhere classified)'
                    },
                    {
                        value: 'R375.R402.R406',
                        label: 'Latin American Languages and Societies (not elsewhere classified'
                    },
                    {
                        value: 'R375.R402.R407',
                        label: 'Near Eastern Languages and Societies'
                    },
                    {
                        value: 'R375.R402.R408',
                        label: 'Slavic Languages and Societies'
                    },
                    {
                        value: 'R375.R402.R409',
                        label: 'South and Southeast Asian Languages and Societies'
                    }
                ]
            },
            {
                value: 'R375.R410',
                label: 'History',
                children: [
                    {
                        value: 'R375.R410.R411',
                        label: 'African'
                    },
                    {
                        value: 'R375.R410.R412',
                        label: 'Asian'
                    },
                    {
                        value: 'R375.R410.R413',
                        label: 'European'
                    },
                    {
                        value: 'R375.R410.R414',
                        label: 'Islamic World/Near East'
                    },
                    {
                        value: 'R375.R410.R415',
                        label: 'Latin American'
                    },
                    {
                        value: 'R375.R410.R416',
                        label: 'United States'
                    },
                    {
                        value: 'R375.R410.R417',
                        label: 'Cultural History'
                    },
                    {
                        value: 'R375.R410.R418',
                        label: 'Diplomatic History'
                    },
                    {
                        value: 'R375.R410.R419',
                        label: 'Gender'
                    },
                    {
                        value: 'R375.R410.R420',
                        label: 'History of Religion'
                    },
                    {
                        value: 'R375.R410.R421',
                        label: 'History of Science, Technology, and Medicine'
                    },
                    {
                        value: 'R375.R410.R422',
                        label: 'Intellectual History'
                    },
                    {
                        value: 'R375.R410.R423',
                        label: 'Legal'
                    },
                    {
                        value: 'R375.R410.R424',
                        label: 'Medieval History'
                    },
                    {
                        value: 'R375.R410.R425',
                        label: 'Military History'
                    },
                    {
                        value: 'R375.R410.R426',
                        label: 'Political History'
                    },
                    {
                        value: 'R375.R410.R427',
                        label: 'Social History'
                    },
                    {
                        value: 'R375.R410.R428',
                        label: 'Women’s History'
                    }
                ]
            },
            {
                value: 'R375.R429',
                label: 'History of Art, Architecture and Archaeology',
                children: [
                    {
                        value: 'R375.R429.R430',
                        label: 'American Art and Architecture'
                    },
                    {
                        value: 'R375.R429.R431',
                        label: 'Ancient, Medieval, Renaissance and Baroque Art and Architecture'
                    },
                    {
                        value: 'R375.R429.R432',
                        label: 'Asian Art and Architecture'
                    },
                    {
                        value: 'R375.R429.R433',
                        label: 'Contemporary Art'
                    },
                    {
                        value: 'R375.R429.R434',
                        label: 'Modern Art and Architecture'
                    },
                    {
                        value: 'R375.R429.R435',
                        label: 'Theory and Criticism'
                    }
                ]
            },
            {
                value: 'R375.R436',
                label: 'Music (except performance)',
                children: [
                    {
                        value: 'R375.R436.R437',
                        label: 'Composition'
                    },
                    {
                        value: 'R375.R436.R438',
                        label: 'Ethnomusicology'
                    },
                    {
                        value: 'R375.R436.R439',
                        label: 'Musicology'
                    },
                    {
                        value: 'R375.R436.R440',
                        label: 'Music Theory'
                    }
                ]
            },
            {
                value: 'R375.R441',
                label: 'Philosophy',
                children: [
                    {
                        value: 'R375.R441.R442',
                        label: 'Continental Philosophy'
                    },
                    {
                        value: 'R375.R441.R443',
                        label: 'Epistemology'
                    },
                    {
                        value: 'R375.R441.R444',
                        label: 'Esthetics'
                    },
                    {
                        value: 'R375.R441.R445',
                        label: 'Ethics and Political Philosophy'
                    },
                    {
                        value: 'R375.R441.R446',
                        label: 'Feminist Philosophy'
                    },
                    {
                        value: 'R375.R441.R447',
                        label: 'History of Philosophy'
                    },
                    {
                        value: 'R375.R441.R448',
                        label: 'Logic and foundations of mathematics'
                    },
                    {
                        value: 'R375.R441.R449',
                        label: 'Metaphysics'
                    },
                    {
                        value: 'R375.R441.R450',
                        label: 'Philosophy of Language'
                    },
                    {
                        value: 'R375.R441.R451',
                        label: 'Philosophy of Mind'
                    },
                    {
                        value: 'R375.R441.R452',
                        label: 'Philosophy of Science'
                    }
                ]
            },
            {
                value: 'R375.R453',
                label: 'Religion',
                children: [
                    {
                        value: 'R375.R453.R454',
                        label: 'Biblical Studies'
                    },
                    {
                        value: 'R375.R453.R455',
                        label: 'Comparative Methodologies and Theories'
                    },
                    {
                        value: 'R375.R453.R456',
                        label: 'Ethics'
                    },
                    {
                        value: 'R375.R453.R457',
                        label: 'History of Religions of Western Origin'
                    },
                    {
                        value: 'R375.R453.R458',
                        label: 'History of Religions of Eastern Origins'
                    },
                    {
                        value: 'R375.R453.R459',
                        label: 'Religious Thought/Theology/Philosophy of Religion'
                    }
                ]
            },
            {
                value: 'R375.R460',
                label: 'Spanish and Portuguese Language and Literature',
                children: [
                    {
                        value: 'R375.R460.R461',
                        label: 'Latin American Literature'
                    },
                    {
                        value: 'R375.R460.R462',
                        label: 'Portuguese Literature'
                    },
                    {
                        value: 'R375.R460.R463',
                        label: 'Spanish Linguistics'
                    },
                    {
                        value: 'R375.R460.R464',
                        label: 'Spanish Literature'
                    }
                ]
            },
            {
                value: 'R375.R465',
                label: 'Theatre and Performance Studies',
                children: [
                    {
                        value: 'R375.R465.R466',
                        label: 'Theatre History'
                    },
                    {
                        value: 'R375.R465.R467',
                        label: 'Dramatic Literature, Criticism and Theory'
                    },
                    {
                        value: 'R375.R465.R468',
                        label: 'Performance Studies'
                    },
                    {
                        value: 'R375.R465.R469',
                        label: 'Playwriting'
                    }
                ]
            },
            {
                value: 'R375.R470',
                label: 'Feminist, Gender, and Sexuality Studies'
            },
            {
                value: 'R375.R471',
                label: 'Film Studies'
            },
            {
                value: 'R375.R472',
                label: 'Race, Ethnicity and post-Colonial Studies'
            },
            {
                value: 'R375.R473',
                label: 'Rhetoric and Composition'
            }
        ]
    }
];

class Widget extends React.Component {
    state = {
        checked: [],
        expanded: []
    };

    componentDidMount() {
        console.log('props', this.props);
        // eslint-disable-next-line react/prop-types
        getRFTreeForNotifications(this.props.user.id)
            .then(rfTree => {
                const arrRf = [];
                for (let index = 0; index < rfTree.length; index++) {
                    const element = rfTree[index]['path'];
                    arrRf.push(element);
                }
                this.state.checked = arrRf;
            })
            .catch(e => {
                console.log(e);
                toast.error(e);
            });
    }

    updateResFields = () => {
        console.log(this.state.checked);
        const notificationResearchFields = {
            researchFields: this.state.checked
        };

        updateResearchFieldNotifications(notificationResearchFields)
            .then(notifications => {
                console.log(notifications);
            })
            .catch(e => {
                console.log(e);
                toast.error('Failed to load notifications data');
            });
    };

    render() {
        return (
            <div>
                <CheckboxTree
                    nodes={nodes}
                    checked={this.state.checked}
                    expanded={this.state.expanded}
                    onCheck={checked => this.setState({ checked })}
                    onExpand={expanded => this.setState({ expanded })}
                    nameAsArray={true}
                    icons={{
                        check: <FontAwesomeIcon icon={faCheckSquare} />,
                        uncheck: <FontAwesomeIcon icon={faSquare} />,
                        halfCheck: <FontAwesomeIcon icon={faSquare} />,
                        expandClose: <FontAwesomeIcon icon={faChevronRight} />,
                        expandOpen: <FontAwesomeIcon icon={faChevronDown} />,
                        expandAll: <FontAwesomeIcon icon={faPlusSquare} />
                    }}
                />
                <div className="mt-2 mb-2">
                    <Button color="primary" onClick={this.updateResFields}>
                        Save Changes
                    </Button>
                </div>
            </div>
        );
    }
}

export default Widget;

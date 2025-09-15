import { createClient } from '@supabase/supabase-js'

// Enhanced country requirements with more detailed document specifications
const africanCountriesRequirements = [
  {
    name: 'Algeria',
    code: 'DZ',
    document_requirements: {
      required_documents: [
        'Application Form',
        'Project Summary',
        'Audited Financial Statements',
        '2 Year Management Accounts',
        '5 Year Cash Flow Projection',
        'Business Plan'
      ],
      company_documents: [
        'Certificate of Incorporation',
        'Commercial Register Extract',
        'Tax Compliance Certificate',
        'Operating License',
        'VAT Registration Certificate'
      ],
      director_documents: [
        'National Identity Card',
        'Tax Identification Number',
        'Criminal Background Check',
        'Proof of Address'
      ]
    }
  },
  {
    name: 'Angola',
    code: 'AO',
    document_requirements: {
      required_documents: [
        'Application Form',
        'Project Summary',
        'Audited Financial Statements',
        '2 Year Management Accounts',
        '5 Year Cash Flow Projection',
        'Environmental Impact Assessment'
      ],
      company_documents: [
        'Certificate of Incorporation',
        'Commercial Registry Certificate',
        'Tax Compliance Certificate',
        'Operating License',
        'Foreign Investment Certificate'
      ],
      director_documents: [
        'Identity Card',
        'Tax Number Certificate',
        'Criminal Record Certificate',
        'Proof of Residence'
      ]
    }
  },
  {
    name: 'Benin',
    code: 'BJ',
    document_requirements: {
      required_documents: [
        'Application Form',
        'Project Summary',
        'Audited Financial Statements',
        '2 Year Management Accounts',
        '5 Year Cash Flow Projection'
      ],
      company_documents: [
        'Certificate of Incorporation',
        'RCCM Registration',
        'Tax Certificate',
        'Operating License',
        'Social Security Registration'
      ],
      director_documents: [
        'National Identity Card',
        'Tax Number',
        'Criminal Background Check'
      ]
    }
  },
  {
    name: 'Botswana',
    code: 'BW',
    document_requirements: {
      required_documents: [
        'Application Form',
        'Project Summary',
        'Audited Financial Statements',
        '2 Year Management Accounts',
        '5 Year Cash Flow Projection',
        'Environmental Compliance Certificate'
      ],
      company_documents: [
        'Certificate of Incorporation',
        'Company Registration',
        'Tax Clearance Certificate',
        'Trading License',
        'BURS Registration'
      ],
      director_documents: [
        'Omang Identity Card',
        'Tax Number',
        'Police Clearance Certificate'
      ]
    }
  },
  {
    name: 'Burkina Faso',
    code: 'BF',
    document_requirements: {
      required_documents: [
        'Application Form',
        'Project Summary',
        'Audited Financial Statements',
        '2 Year Management Accounts',
        '5 Year Cash Flow Projection'
      ],
      company_documents: [
        'Certificate of Incorporation',
        'RCCM Registration',
        'Tax Certificate',
        'Operating License',
        'CNSS Registration'
      ],
      director_documents: [
        'National Identity Card',
        'Tax Number',
        'Criminal Background Check'
      ]
    }
  },
  {
    name: 'Cameroon',
    code: 'CM',
    document_requirements: {
      required_documents: [
        'Application Form',
        'Project Summary',
        'Audited Financial Statements',
        '2 Year Management Accounts',
        '5 Year Cash Flow Projection',
        'Investment Code Certificate'
      ],
      company_documents: [
        'Certificate of Incorporation',
        'RCCM Registration',
        'Tax Certificate',
        'Operating License',
        'CNPS Registration'
      ],
      director_documents: [
        'National Identity Card',
        'Tax Number',
        'Criminal Background Check',
        'Proof of Address'
      ]
    }
  },
  {
    name: 'Cape Verde',
    code: 'CV',
    document_requirements: {
      required_documents: [
        'Application Form',
        'Project Summary',
        'Audited Financial Statements',
        '2 Year Management Accounts',
        '5 Year Cash Flow Projection'
      ],
      company_documents: [
        'Certificate of Incorporation',
        'Commercial Registration',
        'Tax Certificate',
        'Operating License',
        'Social Security Registration'
      ],
      director_documents: [
        'Citizen Card',
        'Tax Number',
        'Criminal Record Certificate'
      ]
    }
  },
  {
    name: 'Chad',
    code: 'TD',
    document_requirements: {
      required_documents: [
        'Application Form',
        'Project Summary',
        'Audited Financial Statements',
        '2 Year Management Accounts',
        '5 Year Cash Flow Projection'
      ],
      company_documents: [
        'Certificate of Incorporation',
        'Commercial Registration',
        'Tax Certificate',
        'Operating License',
        'CNSS Registration'
      ],
      director_documents: [
        'National Identity Card',
        'Tax Number',
        'Criminal Background Check'
      ]
    }
  },
  {
    name: 'Democratic Republic of Congo',
    code: 'CD',
    document_requirements: {
      required_documents: [
        'Application Form',
        'Project Summary',
        'Audited Financial Statements',
        '2 Year Management Accounts',
        '5 Year Cash Flow Projection',
        'Mining/Investment License'
      ],
      company_documents: [
        'Certificate of Incorporation',
        'RCCM Registration',
        'Tax Certificate',
        'Operating License',
        'INSS Registration'
      ],
      director_documents: [
        'National Identity Card',
        'Tax Number',
        'Criminal Background Check',
        'Proof of Address'
      ]
    }
  },
  {
    name: 'Egypt',
    code: 'EG',
    document_requirements: {
      required_documents: [
        'Application Form',
        'Project Summary',
        'Audited Financial Statements',
        '2 Year Management Accounts',
        '5 Year Cash Flow Projection',
        'Investment Approval Certificate'
      ],
      company_documents: [
        'Certificate of Incorporation',
        'Commercial Registration',
        'Tax Card',
        'Operating License',
        'Social Insurance Registration'
      ],
      director_documents: [
        'National Identity Card',
        'Tax Number',
        'Criminal Background Check',
        'Military Service Certificate'
      ]
    }
  },
  {
    name: 'Ethiopia',
    code: 'ET',
    document_requirements: {
      required_documents: [
        'Application Form',
        'Project Summary',
        'Audited Financial Statements',
        '2 Year Management Accounts',
        '5 Year Cash Flow Projection',
        'Investment Permit'
      ],
      company_documents: [
        'Certificate of Incorporation',
        'Commercial Registration',
        'Tax Certificate',
        'Operating License',
        'Environmental Permit'
      ],
      director_documents: [
        'National Identity Card',
        'Tax Identification Number',
        'Criminal Background Check'
      ]
    }
  },
  {
    name: 'Ghana',
    code: 'GH',
    document_requirements: {
      required_documents: [
        'Application Form',
        'Project Summary',
        'Audited Financial Statements',
        '2 Year Management Accounts',
        '5 Year Cash Flow Projection',
        'GIPC Registration Certificate'
      ],
      company_documents: [
        'Certificate of Incorporation',
        'Form 2 (Particulars of Directors)',
        'Tax Clearance Certificate',
        'Operating License',
        'SSNIT Registration'
      ],
      director_documents: [
        'Ghana Card/Passport',
        'TIN Certificate',
        'Police Report',
        'Proof of Address'
      ]
    }
  },
  {
    name: 'Kenya',
    code: 'KE',
    document_requirements: {
      required_documents: [
        'Application Form',
        'Project Summary',
        'Audited Financial Statements',
        '2 Year Management Accounts',
        '5 Year Cash Flow Projection',
        'Environmental Impact Assessment'
      ],
      company_documents: [
        'Certificate of Incorporation',
        'Form CR12 (Annual Returns)',
        'Tax Compliance Certificate',
        'Business Permit',
        'NSSF Registration'
      ],
      director_documents: [
        'National Identity Card/Passport',
        'KRA PIN Certificate',
        'Certificate of Good Conduct',
        'Proof of Address'
      ]
    }
  },
  {
    name: 'Morocco',
    code: 'MA',
    document_requirements: {
      required_documents: [
        'Application Form',
        'Project Summary',
        'Audited Financial Statements',
        '2 Year Management Accounts',
        '5 Year Cash Flow Projection',
        'Investment Agreement'
      ],
      company_documents: [
        'Certificate of Incorporation',
        'Commercial Registration',
        'Tax Certificate',
        'Operating License',
        'CNSS Registration'
      ],
      director_documents: [
        'National Identity Card',
        'Tax Number',
        'Criminal Background Check',
        'Proof of Address'
      ]
    }
  },
  {
    name: 'Nigeria',
    code: 'NG',
    document_requirements: {
      required_documents: [
        'Application Form',
        'Project Summary',
        'Audited Financial Statements',
        '2 Year Management Accounts',
        '5 Year Cash Flow Projection',
        'NIPC Registration Certificate'
      ],
      company_documents: [
        'Certificate of Incorporation',
        'Form CAC 2 (Particulars of Directors)',
        'Tax Clearance Certificate',
        'Operating License',
        'Pension Registration'
      ],
      director_documents: [
        'National Identity Number (NIN)',
        'Tax Identification Number (TIN)',
        'Police Report',
        'Proof of Address'
      ]
    }
  },
  {
    name: 'Rwanda',
    code: 'RW',
    document_requirements: {
      required_documents: [
        'Application Form',
        'Project Summary',
        'Audited Financial Statements',
        '2 Year Management Accounts',
        '5 Year Cash Flow Projection',
        'RDB Investment Certificate'
      ],
      company_documents: [
        'Certificate of Incorporation',
        'Company Registration Extract',
        'Tax Clearance Certificate',
        'Operating License',
        'Social Security Registration'
      ],
      director_documents: [
        'National Identity Card',
        'Tax Identification Number',
        'Criminal Background Check'
      ]
    }
  },
  {
    name: 'Senegal',
    code: 'SN',
    document_requirements: {
      required_documents: [
        'Application Form',
        'Project Summary',
        'Audited Financial Statements',
        '2 Year Management Accounts',
        '5 Year Cash Flow Projection'
      ],
      company_documents: [
        'Certificate of Incorporation',
        'RCCM Registration',
        'Tax Certificate',
        'Operating License',
        'CSS Registration'
      ],
      director_documents: [
        'National Identity Card',
        'Tax Number',
        'Criminal Background Check'
      ]
    }
  },
  {
    name: 'South Africa',
    code: 'ZA',
    document_requirements: {
      required_documents: [
        'Application Form',
        'Project Summary',
        'Audited Financial Statements',
        '2 Year Management Accounts',
        '5 Year Cash Flow Projection',
        'B-BBEE Certificate'
      ],
      company_documents: [
        'Certificate of Incorporation (CK1)',
        'Company Registration (CK2)',
        'Tax Clearance Certificate',
        'Operating License',
        'UIF Registration'
      ],
      director_documents: [
        'South African Identity Document',
        'Tax Number',
        'Police Clearance Certificate',
        'Proof of Address'
      ]
    }
  },
  {
    name: 'Tanzania',
    code: 'TZ',
    document_requirements: {
      required_documents: [
        'Application Form',
        'Project Summary',
        'Audited Financial Statements',
        '2 Year Management Accounts',
        '5 Year Cash Flow Projection',
        'TIC Investment Certificate'
      ],
      company_documents: [
        'Certificate of Incorporation',
        'Form 20 (Annual Return)',
        'Tax Clearance Certificate',
        'Business License',
        'NSSF Registration'
      ],
      director_documents: [
        'National Identity Card',
        'TIN Certificate',
        'Police Report',
        'Proof of Address'
      ]
    }
  },
  {
    name: 'Uganda',
    code: 'UG',
    document_requirements: {
      required_documents: [
        'Application Form',
        'Project Summary',
        'Audited Financial Statements',
        '2 Year Management Accounts',
        '5 Year Cash Flow Projection',
        'UIA Investment License'
      ],
      company_documents: [
        'Certificate of Incorporation',
        'Form 7 (Annual Return)',
        'Tax Clearance Certificate',
        'Trading License',
        'NSSF Registration'
      ],
      director_documents: [
        'National Identity Card',
        'TIN Certificate',
        'Police Report',
        'Proof of Address'
      ]
    }
  },
  {
    name: 'Zambia',
    code: 'ZM',
    document_requirements: {
      required_documents: [
        'Application Form',
        'Project Summary',
        'Audited Financial Statements',
        '2 Year Management Accounts',
        '5 Year Cash Flow Projection',
        'ZDA Investment Certificate'
      ],
      company_documents: [
        'Certificate of Incorporation',
        'Form 20 (Annual Return)',
        'Tax Clearance Certificate',
        'Trading License',
        'NAPSA Registration'
      ],
      director_documents: [
        'National Registration Card',
        'TPIN Certificate',
        'Police Report',
        'Proof of Address'
      ]
    }
  },
  {
    name: 'Zimbabwe',
    code: 'ZW',
    document_requirements: {
      required_documents: [
        'Application Form',
        'Project Summary',
        'Audited Financial Statements',
        '2 Year Management Accounts',
        '5 Year Cash Flow Projection',
        'ZIA Investment License'
      ],
      company_documents: [
        'Certificate of Incorporation',
        'Form CR6 (Annual Return)',
        'Tax Clearance Certificate',
        'Operating License',
        'NSSA Registration'
      ],
      director_documents: [
        'National Identity Card',
        'Tax Number',
        'Police Clearance Certificate',
        'Proof of Address'
      ]
    }
  }
]

export async function seedCountryRequirements() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase configuration')
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  console.log('Starting country requirements seeding...')

  try {
    // Clear existing countries
    const { error: deleteError } = await supabase
      .from('countries')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all

    if (deleteError) {
      console.warn('Warning clearing existing countries:', deleteError.message)
    }

    // Insert new countries with requirements
    const { data, error } = await supabase
      .from('countries')
      .insert(africanCountriesRequirements)
      .select()

    if (error) {
      throw new Error(`Failed to seed countries: ${error.message}`)
    }

    console.log(`Successfully seeded ${data?.length || 0} countries with requirements`)

    // Verify the seeding
    const { data: verifyData, error: verifyError } = await supabase
      .from('countries')
      .select('name, code, document_requirements')
      .order('name')

    if (verifyError) {
      throw new Error(`Failed to verify seeding: ${verifyError.message}`)
    }

    console.log('Verification complete. Countries in database:')
    verifyData?.forEach(country => {
      const reqCount = 
        (country.document_requirements.required_documents?.length || 0) +
        (country.document_requirements.company_documents?.length || 0) +
        (country.document_requirements.director_documents?.length || 0)
      
      console.log(`- ${country.name} (${country.code}): ${reqCount} requirements`)
    })

    return { success: true, count: data?.length || 0 }

  } catch (error) {
    console.error('Seeding failed:', error)
    throw error
  }
}

// Run the seeding if this file is executed directly
if (require.main === module) {
  seedCountryRequirements()
    .then(result => {
      console.log('Seeding completed successfully:', result)
      process.exit(0)
    })
    .catch(error => {
      console.error('Seeding failed:', error)
      process.exit(1)
    })
}
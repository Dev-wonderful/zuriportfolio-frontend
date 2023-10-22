import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import axios from 'axios';
import { DateObject } from 'react-multi-date-picker';
import Data from '@modules/super-admin/analytics-and-reporting/data';
import Modal from '@ui/Modal';
import MultiCalender from '@modules/super-admin/analytics-and-reporting/datePicker';
import SuperAdminNavbar from '@modules/super-admin/components/navigations/SuperAdminNavbar';
import { useRouter } from 'next/router';
import { ImSpinner8 } from 'react-icons/im';
import { ToastContainer, toast } from 'react-toastify';
import { withAdminAuth } from '../../../../../helpers/withAuth';
import Head from 'next/head';

const PortfolioCreationPage: React.FC = () => {
  const [portfolioCreationArray, setPortfolioCreationArray] = useState<any>([]);
  const [loadingState, setLoadingState] = useState<Boolean>(false);
  const [showContent, setShowContent] = useState<Boolean | null>(false);
  const [showItems, setShowItems] = useState<Boolean>(true);
  const [loading, setLoading] = useState<Boolean>(true);
  const [modalSize, setModalSize] = useState<'xl' | 'sm' | 'lg' | 'md' | 'xxl' | undefined>('xl');
  const [reportModalOpen, setReportModalOpen] = useState<Boolean>(false);
  const [selectedFileFormat, setSelectedFileFormat] = useState<string>('');
  const [reportClicked, setReportClicked] = useState<Boolean>(false);
  const [isLoading, setIsLoading] = useState<Boolean>(false);
  const [getReport, setGetReport] = useState<Boolean>(false);
  const [selectedDateRange, setSelectedDateRange] = useState<DateObject[]>([]);
  const [get, setGet] = useState<Boolean>(false);
  const [storeExport, setStoreExport] = useState<any[]>([]);

  useEffect(() => {
    const delay = setTimeout(() => {
      setLoading(false);
      clearTimeout(delay);
    }, 2000);
  }, []);

  const openModal = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setReportModalOpen(true);
    }, 2000);
  };

  useEffect(() => {
    const bearerToken = localStorage.getItem('zpt');
    const apiUrl = 'https://team-mirage-super-amind2.onrender.com/api/v1/super-admin/analytics/portfolio-summary';

    setLoadingState(true);
    axios
      .get(apiUrl, {
        headers: {
          Authorization: `Bearer ${bearerToken}`,
          'Content-Type': 'application/json',
        },
      })
      .then((response) => {
        const twelveMonths = response.data.data.slice(0, 12);
        setPortfolioCreationArray(twelveMonths);
        setLoadingState(false);
      })
      .catch((error) => {
        setLoadingState(false);
        toast.error('Internal Server Error');
      });
  }, []);

  const fetchAnalyticsData = () => {
    if (selectedDateRange.length === 2) {
      const startDate = selectedDateRange[0].format('YYYY-MM-DDTHH:mm:ssZ');
      const endDate = selectedDateRange[1].format('YYYY-MM-DDTHH:mm:ssZ');
      setGet(true);

      const bearerToken = localStorage.getItem('zpt');

      const apiUrl = `https://team-mirage-super-amind2.onrender.com/api/v1/super-admin/analytics/portfolio-summary/?start_date=${startDate}&end_date=${endDate}`;

      setLoadingState(true);

      axios
        .get(apiUrl, {
          headers: {
            Authorization: `Bearer ${bearerToken}`,
            'Content-Type': 'application/json',
          },
        })
        .then((response) => {
          console.log(response.data.data);
          setPortfolioCreationArray(response.data.data);
          setStoreExport(response.data.data);
          setLoadingState(false);
          setGet(false);
        })
        .catch((error) => {
          console.error('Error fetching top-selling products:', error);
          setGet(false);
          setLoadingState(false);
          toast.error('Internal Server Error');
        });
      setReportClicked(!reportClicked);
    } else {
      toast.error('Kindly Select a date range!');
    }
  };

  const router = useRouter();

  const redirectToAnotherPage = () => {
    router.push('/super-admin/analytics-and-reporting/reports');
  };

  const handleDateRangeChange = (dateRange: DateObject[]) => {
    setSelectedDateRange(dateRange);
  };

  const handleFileFormatSelect = (format: string) => {
    setSelectedFileFormat(format);
  };

  useEffect(() => {
    function handleResize() {
      if (window.innerWidth <= 768) {
        setModalSize('sm');
      } else {
        setModalSize('xl');
      }
    }

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [[], reportModalOpen]);

  function saveFile(data: BlobPart, filename: string, contentType: any) {
    const blob = new Blob([data], { type: contentType });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  const handleExport = () => {
    console.log('handleExport called');
    if (selectedDateRange.length === 2 && selectedFileFormat) {
      const startDate = selectedDateRange[0].format('YYYY-MM-DD');
      const endDate = selectedDateRange[1].format('YYYY-MM-DD');
      const bearerToken = localStorage.getItem('zpt');
      setGetReport(true);

      const apiUrl = `https://team-mirage-super-amind2.onrender.com/api/v1/super-admin/analytics/export-report/portfolio_summary/?file_format=${selectedFileFormat}&start_date=${startDate}&end_date=${endDate}`;

      axios
        .get(apiUrl, {
          responseType: 'arraybuffer',
          headers: {
            Authorization: `Bearer ${bearerToken}`,
          },
        })
        .then((response) => {
          console.log(response);
          const contentType = response.headers['content-type'];
          saveFile(response.data, 'Portfolio Creation', contentType);
          setGetReport(false);
          setReportModalOpen(false);
        })
        .catch((error) => {
          setGetReport(false);
          console.error('Error exporting report:', error);
          toast.error('Internal Server Error');
        });
    } else if (!selectedFileFormat) {
      toast.error('Kindly Select a file format!');
      setReportModalOpen(false);
    } else {
      toast.warning('Kindly select a date range!');
    }
  };

  const toggleVisibility = () => {
    setShowItems(!showItems);
  };

  const checkContent = () => {
    setShowContent(!showContent);
  };

  return (
    <>
      <Head>
        <title>Super Admin - Portfolio Creation Reports Page</title>
        <link rel="icon" href="/assets/zuriLogo.svg" />
        <meta name="description" content="Reports Main Page for zuriportfolio, marketplace, etc." />
        <meta
          name="keywords"
          content="reports, get reports with date range, export reports in different filel formats"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      {loading ? (
        <ImSpinner8 className="w-6 h-6 mx-auto my-[3rem] mb-2rem text-brand-success-primary animate-spin" />
      ) : (
        <>
          <SuperAdminNavbar />
          <div className="mx-auto min-[1536px]:max-w-[1536px] max-[1300px]:mx-0 max-[1300px]:px-[1.5rem] max-[768px]:max-w-[46.3rem] max-[768px]:pl-[2.5rem] max-[768px]:px-0 max-w-[77.5rem] w-full max-[500px]:px-[1.5rem] max-[834px]:px-[2.5rem]">
            <div className="flex gap-[1rem] py-[0.75rem] mt-[1.13rem] max-[834px]:mt-[1rem] max-[500px]:mt-[1.5rem]">
              <Image
                onClick={redirectToAnotherPage}
                src="/assets/images/reports/arrow-back.svg"
                width={20}
                height={20}
                alt="Go back"
                className="cursor-pointer"
              />
              <p className="text-[1.125rem] text-[#101828] font-medium leading-[1.75rem] font-manropeL">
                Portfolio Creation
              </p>
            </div>
            <div className="flex gap-[1.5rem] items-center max-[768px]:flex-col max-[768px]:items-stretch mt-[0.5rem] max-[834px]:gap-0 max-[768px]:gap-[1.5rem]">
              <p className="text-[1rem] leading-[1.5rem] font-manropeL font-normal tracking-[0.005rem] text-[#000] max-[850px]:text-[0.875rem] max-[834px]:pr-[0.2rem]">
                Select Time Frame
              </p>
              <div>
                <MultiCalender selectedDateRange={selectedDateRange} onDateRangeChange={handleDateRangeChange} />
              </div>
              <div className="flex gap-[1.5rem] max-[834px]:pl-[1.5rem] max-[834px]:gap-[1.5rem] max-[800px]:pl-[1rem] max-[800px]:gap-[1rem] max-[768px]:gap-[1.5rem] max-[768px]:pl-0">
                <div
                  className="w-[9.6875rem] p-[0.75rem] flex justify-center items-center rounded-[0.5rem] bg-[#009254] tracking-[0.005rem] text-[1rem] leading-[1.5rem] font-manropeL text-[#FFF] cursor-pointer font-normal max-[850px]:w-[8.375rem] max-[500px]:py-[0.5rem] max-[375px]:text-[0.875rem]"
                  onClick={fetchAnalyticsData}
                >
                  {get ? (
                    <div className="w-6 h-6 border-t-2 border-[#fff] border-solid rounded-full animate-spin"></div>
                  ) : (
                    'Get Report'
                  )}
                </div>
                <div
                  onClick={() => openModal()}
                  className="w-[9.6875rem] p-[0.75rem] flex justify-center items-center rounded-[0.5rem] bg-[rgba(210,255,231,0.15)] border border-[#009254] tracking-[0.005rem] text-[1rem] leading-[1.5rem] font-manropeL text-[#386A20] font-normal max-[850px]:w-[8.375rem] max-[500px]:py-[0.5rem] max-[500px]:p-[0.5rem] max-[375px]:text-[0.875rem] cursor-pointer"
                >
                  {isLoading ? (
                    <div className="w-6 h-6 border-t-2 border-[#386A20] border-solid rounded-full animate-spin"></div>
                  ) : (
                    'Export Report'
                  )}
                </div>
              </div>
            </div>
          </div>
          {reportModalOpen && (
            <div className="">
              <Modal
                closeOnOverlayClick
                closeModal={() => setReportModalOpen(false)}
                isCloseIconPresent={false}
                isOpen
                size={modalSize}
              >
                {
                  <div className="flex justify-center w-auto flex-col gap-[2.88rem] m-[1.88rem] max-[768px]:m-[0.27rem] max-[768px]:gap-[1.27rem]">
                    <div className="border-b-[#A8ACAB] border-b-[0.11994rem] pb-[1.2rem] max-[768px]:pb-[0.53rem]">
                      <p className="text-[#000] font-manropeL font-semibold text-[1.9188rem] text-center leading-[2.87825rem] tracking-[0.00288rem] max-[768px]:text-[0.85rem] max-[768px]:leading-[1.27088rem]">
                        Export Report
                      </p>
                    </div>
                    <div className="flex flex-col gap-[1.02rem] max-[768px]:gap-[0.85rem]">
                      <p className="text-center text-[#000] font-normal leading-[2.87825rem] font-manropeL text-[1.9188rem] tracking-[0.00963rem] max-[768px]:text-[0.84725rem] max-[768px]:leading-[1.27088rem]">
                        Choose Format
                      </p>
                      <div className="flex justify-evenly">
                        <div
                          className={`${
                            selectedFileFormat === 'excel'
                              ? 'border border-[#33A467] text-[#009254] bg-[#E6F5EA] flex justify-center items-center max-w-[9.59425rem] w-full rounded-[0.95944rem] py-[1.2rem] font-manropeL shadow-[0px_1.91885px_3.83771px_0px_rgba(16,24,40,0.05)] text-[1.9188rem] hover:bg-[#E6F5EA] text-center leading-[2.87825rem] tracking-[0.00288rem] max-[768px]:text-[0.84725rem] max-[768px]:w-[4.23625rem] max-[768px]:py-[0.74rem] max-[768px]:leading-[1.278rem] cursor-pointer'
                              : 'flex justify-center items-center max-w-[9.59425rem] w-full rounded-[0.95944rem] text-[#8D9290] py-[1.2rem] font-manropeL hover:text-[#009254] focus:bg-[#E6F5EA] hover:border hover:border-[#33A467] border-gray-300 shadow-[0px_1.91885px_3.83771px_0px_rgba(16,24,40,0.05)] text-[1.9188rem] hover:bg-[#E6F5EA] text-center leading-[2.87825rem] tracking-[0.00288rem] max-[768px]:text-[0.84725rem] max-[768px]:w-[4.23625rem] max-[768px]:py-[0.74rem] max-[768px]:leading-[1.278rem] focus:text-[#009254] focus:border focus:border-[#33A467] cursor-pointer'
                          } cursor-pointer`}
                          onClick={() => handleFileFormatSelect('excel')}
                        >
                          Excel
                        </div>
                        <div
                          className={`${
                            selectedFileFormat === 'pdf'
                              ? 'border border-[#33A467] text-[#009254] bg-[#E6F5EA] flex justify-center items-center max-w-[9.59425rem] w-full rounded-[0.95944rem] py-[1.2rem] font-manropeL shadow-[0px_1.91885px_3.83771px_0px_rgba(16,24,40,0.05)] text-[1.9188rem] hover:bg-[#E6F5EA] text-center leading-[2.87825rem] tracking-[0.00288rem] max-[768px]:text-[0.84725rem] max-[768px]:w-[4.23625rem] max-[768px]:py-[0.74rem] max-[768px]:leading-[1.278rem] cursor-pointer'
                              : 'flex justify-center items-center max-w-[9.59425rem] w-full rounded-[0.95944rem] text-[#8D9290] py-[1.2rem] font-manropeL hover:text-[#009254] focus:bg-[#E6F5EA] hover:border hover:border-[#33A467] border-gray-300 shadow-[0px_1.91885px_3.83771px_0px_rgba(16,24,40,0.05)] text-[1.9188rem] hover:bg-[#E6F5EA] text-center leading-[2.87825rem] tracking-[0.00288rem] max-[768px]:text-[0.84725rem] max-[768px]:w-[4.23625rem] max-[768px]:py-[0.74rem] max-[768px]:leading-[1.278rem] focus:text-[#009254] focus:border focus:border-[#33A467] cursor-pointer'
                          } cursor-pointer`}
                          onClick={() => handleFileFormatSelect('pdf')}
                        >
                          PDF
                        </div>
                        <div
                          className={`${
                            selectedFileFormat === 'csv'
                              ? 'border border-[#33A467] text-[#009254] bg-[#E6F5EA] flex justify-center items-center max-w-[9.59425rem] w-full rounded-[0.95944rem] py-[1.2rem] font-manropeL shadow-[0px_1.91885px_3.83771px_0px_rgba(16,24,40,0.05)] text-[1.9188rem] hover:bg-[#E6F5EA] text-center leading-[2.87825rem] tracking-[0.00288rem] max-[768px]:text-[0.84725rem] max-[768px]:w-[4.23625rem] max-[768px]:py-[0.74rem] max-[768px]:leading-[1.278rem] cursor-pointer'
                              : 'flex justify-center items-center max-w-[9.59425rem] w-full rounded-[0.95944rem] text-[#8D9290] py-[1.2rem] font-manropeL hover:text-[#009254] focus:bg-[#E6F5EA] hover:border hover:border-[#33A467] border-gray-300 shadow-[0px_1.91885px_3.83771px_0px_rgba(16,24,40,0.05)] text-[1.9188rem] hover:bg-[#E6F5EA] text-center leading-[2.87825rem] tracking-[0.00288rem] max-[768px]:text-[0.84725rem] max-[768px]:w-[4.23625rem] max-[768px]:py-[0.74rem] max-[768px]:leading-[1.278rem] focus:text-[#009254] focus:border focus:border-[#33A467] cursor-pointer'
                          } cursor-pointer`}
                          onClick={() => handleFileFormatSelect('csv')}
                        >
                          CSV
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-evenly">
                      <div
                        className="flex justify-center items-center bg-[#009254] rounded-[1.91888rem] max-w-[17.50956rem] w-full h-[5.75656rem] font-manropeL text-[#FFF] text-[1.5rem] font-extrabold tracking-[0.00088rem] leading-[1.375rem] max-[768px]:text-[0.875rem] max-[768px]:w-[7.73119rem] max-[768px]:h-[2.5rem] cursor-pointer"
                        onClick={handleExport}
                      >
                        {getReport ? (
                          <div className="w-6 h-6 border-t-2 border-[#fff] border-solid rounded-full animate-spin"></div>
                        ) : (
                          'Confirm'
                        )}
                      </div>
                      <div
                        className="flex justify-center items-center bg-[#F4FBF6] border-[1.919px] border-[#009254] rounded-[1.91888rem] max-w-[17.50956rem] w-full h-[5.75656rem] font-manropeL text-[#009254] text-[1.5rem] font-extrabold tracking-[0.00088rem] leading-[1.375rem] max-[768px]:text-[0.875rem] max-[768px]:w-[7.73119rem] max-[768px]:h-[2.5rem] cursor-pointer"
                        onClick={() => setReportModalOpen(false)}
                      >
                        Cancel
                      </div>
                    </div>
                  </div>
                }
              </Modal>
            </div>
          )}
          <div className="max-[1310px]:px-[1rem] w-full max-[834px]:px-[2.5rem] max-[760px]:pr-0 max-[830px]:px-[2.5rem] max-[500px]:px-[1.5rem] max-[500px]:pr-0 mb-[3rem]">
            <div className="max-w-[77.5rem] w-full mt-[3rem] min-[1536px]:max-w-[1536px] flex flex-col gap-[0.9375rem] bg-[#FFF] mx-auto max-[730px]:max-w-[100%] max-[760px]:rounded-tr-none max-[760px]:rounded-br-none max-[760px]:border-r-0">
              <div className="w-full">
                <div className="max-[778px]:overflow-x-scroll no-scrollbar">
                  <div className="min-[1536px]:gap-[6rem] flex items-center px-[1.5rem] py-[0.75rem] max-[834px]:items-baseline bg-[#FCFCFD] border-b-[0.0625rem] border-[#EAECF0] max-[730px]:flex max-[950px]:w-[75.563rem]">
                    <div className="flex items-center max-w-[9.53rem] gap-[0.25rem] w-full max-[834px]:max-w-[8rem] max-[950px]:min-w-[9.53rem]">
                      <h6 className="text-[0.875rem] font-manropeL text-[#444846] font-normal leading-[1.25rem] tracking-[0.00088rem] max-[880px]:text-[0.75rem] ">
                        Month Created
                      </h6>
                      <Image
                        src={`${showItems ? '/assets/images/reports/upp.svg' : '/assets/images/arrow-down.svg'}`}
                        onClick={toggleVisibility}
                        alt="Down Arrow"
                        width={16}
                        height={16}
                        className="cursor-pointer"
                      />
                    </div>
                    <div className="max-w-[11.25rem] w-full max-[730px]:ml-0 max-[834px]:max-w-[7.875rem] max-[950px]:min-w-[11.25rem]">
                      <p className="text-[0.875rem] font-manropeL text-[#667085] font-normal leading-[1.25rem] tracking-[0.00088rem]">
                        Total Portfolios Created
                      </p>
                    </div>
                    <div className="max-[950px]:min-w-[9rem] pl-[1.5rem] max-[834px]:pl-0">
                      <p className="text-[0.875rem] text-center font-manropeL text-[#667085] max-[950px]:text-start max-[778px]:text-start font-normal leading-[1.25rem] tracking-[0.00088rem]">
                        Categories
                      </p>
                    </div>
                  </div>
                  {loadingState ? (
                    <ImSpinner8 className="w-6 h-6 mx-auto my-[3rem] mb-2rem text-brand-success-primary animate-spin" />
                  ) : (
                    portfolioCreationArray?.map((data: any) => {
                      return (
                        <div key={data.id}>
                          <Data data={data} showItems={showItems} />
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
            <ToastContainer />
          </div>
        </>
      )}
    </>
  );
};

export default withAdminAuth(PortfolioCreationPage);

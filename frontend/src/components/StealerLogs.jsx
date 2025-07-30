import React, { useState, useEffect } from 'react';
import { Table, Thead, Tbody, Tr, Th, Td } from 'react-super-responsive-table';
import 'react-super-responsive-table/dist/SuperResponsiveTableStyle.css';
import { ChevronDownIcon, ChevronRightIcon, ArrowDownTrayIcon } from '@heroicons/react/24/solid';
import { FaWindows } from 'react-icons/fa';

const getOsIcon = (osString) => {
    if (osString && osString.toLowerCase().includes('windows')) {
        return <FaWindows className="h-5 w-5 text-blue-500" />;
    }
    // Future: Add icons for other OS (e.g., FaLinux, FaApple)
    return null;
};

const LogRow = ({ item }) => {
    const [isOpen, setIsOpen] = useState(false);
    const data = typeof item.data === 'string' ? JSON.parse(item.data) : item.data;

    let systemInfo = {};
    try {
        if (data.extracted_data && data.extracted_data['System.txt']) {
            // The content of System.txt is a JSON string itself
            systemInfo = JSON.parse(data.extracted_data['System.txt']);
        }
    } catch (e) {
        console.error("Failed to parse system info from loot data:", e);
    }

    const osIcon = getOsIcon(systemInfo.os);
    const name = systemInfo.hostname || item.agent_id; // Fallback to agent_id if hostname not present

    return (
        <>
            <Tr className="cursor-pointer hover:bg-gray-50" onClick={() => setIsOpen(!isOpen)}>
                <Td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center">
                        {isOpen ? <ChevronDownIcon className="h-5 w-5" /> : <ChevronRightIcon className="h-5 w-5" />}
                        <span className="ml-2">{item.id}</span>
                    </div>
                </Td>
                <Td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {osIcon}
                </Td>
                <Td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                    {name}
                </Td>
                <Td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    N/A
                </Td>
                <Td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(item.collected_at).toLocaleString()}
                </Td>
            </Tr>
            {isOpen && (
                <Tr>
                    <Td colSpan="5" className="p-0">
                        <div className="p-4 bg-gray-50">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                                <div className="bg-white p-3 rounded-lg shadow-sm"><strong>Type:</strong> <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${data.type === 'exfiltration' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>{data.type}</span></div>
                                <div className="bg-white p-3 rounded-lg shadow-sm"><strong>Collected At:</strong> {new Date(item.collected_at).toLocaleString()}</div>
                                <div className="bg-white p-3 rounded-lg shadow-sm"><strong>PID:</strong> {data.pid}</div>
                                <div className="bg-white p-3 rounded-lg shadow-sm"><strong>LID:</strong> <span className="font-mono">{data.lid}</span></div>
                                <div className="bg-white p-3 rounded-lg shadow-sm"><strong>ZIP Size:</strong> {data.zip_size} bytes</div>
                                <div className="bg-white p-3 rounded-lg shadow-sm"><strong>File Count:</strong> {data.file_count}</div>
                                <div className="bg-white p-3 rounded-lg shadow-sm col-span-1 md:col-span-2"><strong>OS:</strong> {systemInfo.os || 'N/A'}</div>
                            </div>
                            <div className="mt-4 flex justify-end">
                                <a
                                    href={`http://localhost:3001/api/dev/loot/${item.id}/download`}
                                    download
                                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                    <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
                                    Download ZIP
                                </a>
                            </div>
                            <div className="mt-4">
                                <h4 className="font-semibold">Files:</h4>
                                <pre className="bg-white p-3 rounded-lg shadow-sm mt-2 max-h-60 overflow-auto font-mono text-xs">
                                    {JSON.stringify(data.extracted_data, null, 2)}
                                </pre>
                            </div>
                        </div>
                    </Td>
                </Tr>
            )}
        </>
    );
};

const StealerLogs = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch('http://localhost:3001/api/dev/loot', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(errorData.error || 'Failed to fetch logs');
                }

                const data = await response.json();
                setLogs(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchLogs();
    }, []);

    if (loading) return <div className="p-6">Loading logs...</div>;
    if (error) return <div className="p-6 text-red-500">Error: {error}</div>;

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">InfoStealer Logs</h1>
            <div className="bg-white shadow rounded-lg overflow-hidden">
                <Table className="min-w-full divide-y divide-gray-200">
                    <Thead className="bg-gray-50">
                        <Tr>
                                                                                    <Th style={{ width: '5%' }} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</Th>
                            <Th style={{ width: '5%' }} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">OS</Th>
                            <Th style={{ width: '40%' }} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</Th>
                            <Th style={{ width: '20%' }} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Country</Th>
                            <Th style={{ width: '30%' }} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</Th>
                        </Tr>
                    </Thead>
                    <Tbody className="bg-white divide-y divide-gray-200">
                        {logs.length > 0 ? (
                            logs.map(item => <LogRow key={item.id} item={item} />)
                        ) : (
                            <Tr>
                                <Td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                                    No loot data available. Submit a build request and deploy the payload to collect data.
                                </Td>
                            </Tr>
                        )}
                    </Tbody>
                </Table>
            </div>
        </div>
    );
};

export default StealerLogs;

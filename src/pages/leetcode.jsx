import { useEffect, useState } from 'react';

export default function LeetCodeStats() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    async function fetchStats() {
      const response = await fetch('/api/leetcode');
      const data = await response.json();
      setStats(data);
    }
    fetchStats();
  }, []);

  if (!stats) {
    return <div className="text-center text-white">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-2xl font-bold mb-4 text-center text-white">LeetCode Stats</h1>
      <div className="bg-white bg-opacity-75 shadow-md rounded p-4 mb-4">
        <h2 className="text-xl font-semibold mb-2 text-gray-800">Profile Information</h2>
        <p className="text-gray-700"><strong>Location:</strong> {stats.profile_information.location}</p>
        <p className="text-gray-700"><strong>University:</strong> {stats.profile_information.university}</p>
        <p className="text-gray-700"><strong>Website:</strong> <a href={stats.profile_information.website} className="text-blue-500 hover:underline">{stats.profile_information.website}</a></p>
        <p className="text-gray-700"><strong>GitHub:</strong> {stats.profile_information.github}</p>
        <p className="text-gray-700"><strong>LinkedIn:</strong> {stats.profile_information.linkedin}</p>
      </div>
      <div className="bg-white bg-opacity-75 shadow-md rounded p-4 mb-4">
        <h2 className="text-xl font-semibold mb-2 text-gray-800">LeetCode Profile Stats</h2>
        <p className="text-gray-700"><strong>Total Solved:</strong> {stats.leetcode_profile_stats.total_solved.count} / {stats.leetcode_profile_stats.total_solved.out_of}</p>
        <p className="text-gray-700"><strong>Easy:</strong> {stats.leetcode_profile_stats.solved_by_difficulty.easy.count} / {stats.leetcode_profile_stats.solved_by_difficulty.easy.out_of}</p>
        <p className="text-gray-700"><strong>Medium:</strong> {stats.leetcode_profile_stats.solved_by_difficulty.medium.count} / {stats.leetcode_profile_stats.solved_by_difficulty.medium.out_of}</p>
        <p className="text-gray-700"><strong>Hard:</strong> {stats.leetcode_profile_stats.solved_by_difficulty.hard.count} / {stats.leetcode_profile_stats.solved_by_difficulty.hard.out_of}</p>
        <p className="text-gray-700"><strong>Rank:</strong> {stats.leetcode_profile_stats.rank}</p>
        <p className="text-gray-700"><strong>Currently Attempting:</strong> {stats.leetcode_profile_stats.currently_attempting}</p>
        <p className="text-gray-700"><strong>Submissions Past Year:</strong> {stats.leetcode_profile_stats.submissions_past_year}</p>
      </div>
      <div className="bg-white bg-opacity-75 shadow-md rounded p-4 mb-4">
        <h2 className="text-xl font-semibold mb-2 text-gray-800">Recent Submissions</h2>
        <ul className="list-disc list-inside text-gray-700">
          {stats.recent_submissions.map((submission, index) => (
            <li key={index} className="mb-1">
              <strong>{submission.time_ago}:</strong> {submission.title}
            </li>
          ))}
        </ul>
      </div>
      <div className="bg-white bg-opacity-75 shadow-md rounded p-4 mb-4">
        <h2 className="text-xl font-semibold mb-2 text-gray-800">Skills</h2>
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Advanced</h3>
          <ul className="list-disc list-inside text-gray-700">
            {stats.skills.advanced.map((skill, index) => (
              <li key={index}>{skill.skill} x{skill.count}</li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Intermediate</h3>
          <ul className="list-disc list-inside text-gray-700">
            {stats.skills.intermediate.map((skill, index) => (
              <li key={index}>{skill.skill} x{skill.count}</li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Fundamental</h3>
          <ul className="list-disc list-inside text-gray-700">
            {stats.skills.fundamental.map((skill, index) => (
              <li key={index}>{skill.skill} x{skill.count}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}